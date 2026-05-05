import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

// ---------------------------------------------------------------------------
// Tipos del payload de Cal.com
// ---------------------------------------------------------------------------

interface CalComAttendee {
  name: string;
  email: string;
  timeZone?: string;
  phoneNumber?: string;
}

interface CalComResponses {
  name?: { value: string };
  email?: { value: string };
  // Campos personalizados configurados en Cal.com:
  // "Nombre del Perro" con slug "nombre_perro"
  nombre_perro?: { value: string };
  // "Raza" con slug "raza_perro"
  raza_perro?: { value: string };
  // "Teléfono" con slug "telefono"
  telefono?: { value: string };
  notes?: { value: string };
  [key: string]: { value: string } | undefined;
}

interface CalComBookingPayload {
  uid: string;
  title: string; // nombre del tipo de evento, ej: "Corte y Baño"
  startTime: string; // ISO 8601
  endTime: string;
  status: "ACCEPTED" | "CANCELLED" | "PENDING" | "REJECTED";
  attendees: CalComAttendee[];
  responses?: CalComResponses;
  metadata?: Record<string, string>;
}

interface CalComWebhookBody {
  triggerEvent:
    | "BOOKING_CREATED"
    | "BOOKING_RESCHEDULED"
    | "BOOKING_CANCELLED"
    | string;
  createdAt: string;
  payload: CalComBookingPayload;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!env.CALCOM_WEBHOOK_SECRET) {
    // En desarrollo puede no estar configurado — permitir (loguear aviso)
    console.warn(
      "[calcom-webhook] CALCOM_WEBHOOK_SECRET no configurado. Omitiendo validación de firma.",
    );
    return true;
  }
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", env.CALCOM_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")}`;

  // Comparación de tiempo constante para evitar timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Lógica de upsert
// ---------------------------------------------------------------------------

async function handleBookingCreated(payload: CalComBookingPayload) {
  const attendee = payload.attendees[0];
  if (!attendee) throw new Error("Reserva sin asistente");

  const responses = payload.responses ?? {};
  const ownerName = responses.name?.value ?? attendee.name;
  const ownerEmail = responses.email?.value ?? attendee.email ?? null;
  const ownerPhone = responses.telefono?.value ?? attendee.phoneNumber ?? "";
  const dogName = responses.nombre_perro?.value ?? "Sin nombre";
  const dogBreed = responses.raza_perro?.value ?? "Sin raza";
  const notes = responses.notes?.value ?? null;

  // 1. Upsert Service por nombre del tipo de evento
  let service = await prisma.service.findFirst({
    where: {
      name: { contains: payload.title, mode: "insensitive" },
      isActive: true,
    },
  });
  if (!service) {
    // Fallback al primer servicio activo si no hay coincidencia exacta
    service = await prisma.service.findFirst({ where: { isActive: true } });
  }
  if (!service)
    throw new Error("No hay servicios configurados en la base de datos");

  // 2. Upsert Owner por email o por nombre+teléfono
  let owner = ownerEmail
    ? await prisma.owner.findFirst({ where: { email: ownerEmail } })
    : null;

  if (!owner) {
    owner = await prisma.owner.create({
      data: { name: ownerName, email: ownerEmail, phone: ownerPhone },
    });
  } else {
    // Actualizar teléfono si llegó con más datos
    owner = await prisma.owner.update({
      where: { id: owner.id },
      data: { phone: ownerPhone || owner.phone },
    });
  }

  // 3. Upsert Dog por nombre dentro del mismo owner
  let dog = await prisma.dog.findFirst({
    where: {
      ownerId: owner.id,
      name: { equals: dogName, mode: "insensitive" },
    },
  });
  if (!dog) {
    dog = await prisma.dog.create({
      data: { name: dogName, breed: dogBreed, ownerId: owner.id },
    });
  }

  // 4. Crear Appointment (idempotente vía calComUid)
  await prisma.appointment.upsert({
    where: { calComUid: payload.uid },
    create: {
      calComUid: payload.uid,
      date: new Date(payload.startTime),
      status: "CONFIRMED",
      serviceId: service.id,
      dogId: dog.id,
      notes: notes,
    },
    update: {
      // Si Cal.com reenvía el evento, no sobreescribimos nada crítico
      date: new Date(payload.startTime),
    },
  });
}

async function handleBookingCancelled(payload: CalComBookingPayload) {
  await prisma.appointment.updateMany({
    where: { calComUid: payload.uid },
    data: { status: "CANCELLED" },
  });
}

async function handleBookingRescheduled(payload: CalComBookingPayload) {
  await prisma.appointment.updateMany({
    where: { calComUid: payload.uid },
    data: { date: new Date(payload.startTime) },
  });
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Cal-Signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let body: CalComWebhookBody;
  try {
    body = JSON.parse(rawBody) as CalComWebhookBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    switch (body.triggerEvent) {
      case "BOOKING_CREATED":
        await handleBookingCreated(body.payload);
        break;
      case "BOOKING_RESCHEDULED":
        await handleBookingRescheduled(body.payload);
        break;
      case "BOOKING_CANCELLED":
        await handleBookingCancelled(body.payload);
        break;
      default:
        // Evento no gestionado — responder 200 para que Cal.com no reintente
        console.info(`[calcom-webhook] Evento ignorado: ${body.triggerEvent}`);
    }
  } catch (err) {
    console.error("[calcom-webhook] Error procesando evento:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
