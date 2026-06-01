// GET /api/admin/available-slots?date=YYYY-MM-DD&serviceId=xxx
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { env } from "@/env";

const WORK_START = 8;
const WORK_END = 19;

// Tipo para los slots de la respuesta Cal.com v2
interface CalComSlot {
  time: string; // ISO 8601 UTC, ej: "2025-06-15T12:00:00.000Z"
}

interface CalComSlotsResponse {
  status: "success" | "error";
  data?: {
    slots: Record<string, CalComSlot[]>; // clave: "YYYY-MM-DD", valor: array de slots
  };
  error?: {
    message: string;
    code: string;
  };
}

interface SlotResult {
  time: string;       // "HH:MM" en timezone America/Santiago
  available: boolean;
}

// ─── Fallback local (lógica original) ───────────────────────────────────────

async function getLocalSlots(
  dateStr: string,
  durationMs: number,
): Promise<SlotResult[]> {
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED"] },
    },
    select: {
      date: true,
      service: { select: { duration: true } },
    },
  });

  const slots: SlotResult[] = [];
  const workEnd = new Date(
    `${dateStr}T${String(WORK_END).padStart(2, "0")}:00:00`,
  );
  const current = new Date(
    `${dateStr}T${String(WORK_START).padStart(2, "0")}:00:00`,
  );

  while (current.getTime() + durationMs <= workEnd.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMs);
    const hasConflict = existingAppointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(
        apptStart.getTime() + appt.service.duration * 60 * 1000,
      );
      return current < apptEnd && slotEnd > apptStart;
    });

    const hours = String(current.getHours()).padStart(2, "0");
    const minutes = String(current.getMinutes()).padStart(2, "0");
    slots.push({ time: `${hours}:${minutes}`, available: !hasConflict });
    current.setTime(current.getTime() + durationMs);
  }

  return slots;
}

// ─── Llamada a Cal.com API v2 ────────────────────────────────────────────────

async function getCalComSlots(
  dateStr: string,
  calComLink: string,
  apiKey: string,
): Promise<SlotResult[] | null> {
  // calComLink puede ser una URL completa ("https://cal.com/username/event-slug") o "username/event-slug"
  let calPath = calComLink;
  try {
    const urlObj = new URL(calComLink);
    // Eliminar el primer slash para que quede "username/event-slug"
    calPath = urlObj.pathname.replace(/^\//, "");
  } catch {
    // Si falla, asumimos que ya viene como "username/event-slug"
  }

  const parts = calPath.split("/");
  if (parts.length < 2) return null;

  const username = parts[0];
  const eventTypeSlug = parts.slice(1).join("/"); // soportar slugs con "/"

  // Convertir dateStr a rango UTC que cubra el día completo en America/Santiago
  // Santiago UTC-4 en verano, UTC-3 en invierno. Para ser seguro: tomamos ±12h
  const startUTC = new Date(`${dateStr}T00:00:00-04:00`).toISOString();
  const endUTC = new Date(`${dateStr}T23:59:59-03:00`).toISOString();

  const params = new URLSearchParams({
    username,
    eventTypeSlug,
    start: startUTC,
    end: endUTC,
    timeZone: "America/Santiago",
  });

  const url = `https://api.cal.com/v2/slots?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-09-04",
      "Content-Type": "application/json",
    },
    // Timeout más conservador: si Cal.com tarda +8s, caemos en fallback
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    console.error(
      `[available-slots] Cal.com API respondió ${response.status}: ${await response.text()}`,
    );
    return null;
  }

  const json = (await response.json()) as CalComSlotsResponse;

  if (json.status !== "success" || !json.data) {
    console.error(
      "[available-slots] Cal.com respuesta inesperada:",
      JSON.stringify(json),
    );
    return null;
  }

  // La respuesta tiene formato: { "data": { "2026-06-09": [{ start: "2026-06-09T09:00:00.000-04:00" }, ...] } }
  // Podría venir en distintos formatos de fecha — tomamos TODOS los slots
  // json.data es el objeto con las fechas
  const allSlots = Object.values(json.data).flat() as { start?: string; time?: string }[];

  if (allSlots.length === 0) {
    // No hay slots disponibles según Cal.com (día bloqueado, sin horarios, etc.)
    return [];
  }

  // Convertir cada slot a hora local en America/Santiago con formato "HH:MM"
  const results: SlotResult[] = allSlots.map((slot) => {
    // La API a veces devuelve 'start' o 'time', dependendo del endpoint exacto
    const slotTime = slot.start || slot.time;
    if (!slotTime) return { time: "00:00", available: false };

    const date = new Date(slotTime);
    const time = date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Santiago",
    });
    return {
      time,        // "HH:MM"
      available: true,  // Cal.com SOLO retorna slots disponibles
    };
  }).filter(s => s.available);

  // Ordenar cronológicamente
  results.sort((a, b) => a.time.localeCompare(b.time));
  return results;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const dateStr = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { duration: true, calComLink: true },
  });

  if (!service) {
    return NextResponse.json(
      { error: "Servicio no encontrado" },
      { status: 404 },
    );
  }

  const durationMs = service.duration * 60 * 1000;

  // Intentar Cal.com primero si tenemos la configuración necesaria
  if (service.calComLink && env.CALCOM_API_KEY) {
    try {
      const calComSlots = await getCalComSlots(
        dateStr,
        service.calComLink,
        env.CALCOM_API_KEY,
      );

      if (calComSlots !== null) {
        console.info(
          `[available-slots] Usando slots de Cal.com: ${calComSlots.length} slots para ${dateStr}`,
        );
        return NextResponse.json({ slots: calComSlots, source: "calcom" });
      }
    } catch (calError) {
      console.error(
        "[available-slots] Error consultando Cal.com, usando fallback local:",
        calError,
      );
    }
  } else {
    console.info(
      `[available-slots] Usando cálculo local: calComLink=${service.calComLink ?? "no configurado"}, apiKey=${env.CALCOM_API_KEY ? "OK" : "no configurada"}`,
    );
  }

  // Fallback al cálculo local original
  const localSlots = await getLocalSlots(dateStr, durationMs);
  return NextResponse.json({ slots: localSlots, source: "local" });
}
