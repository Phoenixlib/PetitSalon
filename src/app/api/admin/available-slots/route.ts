// GET /api/admin/available-slots?date=YYYY-MM-DD&serviceId=xxx
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const WORK_START = 8;   // 08:00
const WORK_END = 19;    // 19:00 (último slot puede comenzar a las 17:30 si el servicio dura 90 min)

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
  const dateStr = searchParams.get("date");    // "YYYY-MM-DD"
  const serviceId = searchParams.get("serviceId");

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  // 1. Obtener duración del servicio
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { duration: true },
  });

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const durationMs = service.duration * 60 * 1000;

  // 2. Obtener citas existentes para ese día
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

  // 3. Generar todos los slots del día
  const slots: { time: string; available: boolean }[] = [];
  const slotStart = new Date(`${dateStr}T${String(WORK_START).padStart(2, "0")}:00:00`);
  const workEnd = new Date(`${dateStr}T${String(WORK_END).padStart(2, "0")}:00:00`);

  const current = new Date(slotStart);
  while (current.getTime() + durationMs <= workEnd.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMs);

    // 4. Verificar solapamiento con citas existentes
    const hasConflict = existingAppointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(apptStart.getTime() + appt.service.duration * 60 * 1000);
      return current < apptEnd && slotEnd > apptStart;
    });

    const hours = String(current.getHours()).padStart(2, "0");
    const minutes = String(current.getMinutes()).padStart(2, "0");
    slots.push({ time: `${hours}:${minutes}`, available: !hasConflict });

    current.setTime(current.getTime() + durationMs);
  }

  return NextResponse.json({ slots });
}
