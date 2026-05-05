import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendNewAppointmentEmail } from "@/lib/email";

const bookingSchema = z.object({
  serviceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  dogName: z.string().min(1).max(60),
  dogBreed: z.string().min(1).max(80),
  dogSize: z.enum(["XS", "S", "M", "L", "XL"]),
  dogNotes: z.string().max(500).optional(),
  ownerName: z.string().min(1).max(100),
  ownerPhone: z.string().min(6).max(20),
  ownerEmail: z.string().email().optional().or(z.literal("")),
});

/**
 * POST /api/appointments
 *
 * Crea una nueva cita con estado PENDING.
 * Crea también el Owner y el Dog si no existen (por teléfono).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const {
    serviceId,
    date,
    time,
    dogName,
    dogBreed,
    dogSize,
    dogNotes,
    ownerName,
    ownerPhone,
    ownerEmail,
  } = parsed.data;

  // Validar que el servicio existe
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true, name: true, duration: true },
  });
  if (!service) {
    return NextResponse.json(
      { error: "Servicio no encontrado" },
      { status: 404 },
    );
  }

  // Construir el DateTime de la cita
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0);

  // Verificar que el slot sigue disponible
  const slotEnd = new Date(
    appointmentDate.getTime() + service.duration * 60_000,
  );
  const conflicting = await prisma.appointment.findFirst({
    where: {
      status: { not: "CANCELLED" },
      date: { gte: appointmentDate, lt: slotEnd },
    },
  });
  if (conflicting) {
    return NextResponse.json(
      { error: "El horario ya no está disponible. Elige otro." },
      { status: 409 },
    );
  }

  // Buscar o crear el dueño
  let owner = await prisma.owner.findFirst({
    where: { phone: ownerPhone },
  });
  if (!owner) {
    owner = await prisma.owner.create({
      data: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail || null,
      },
    });
  }

  // Crear el perro
  const dog = await prisma.dog.create({
    data: {
      name: dogName,
      breed: dogBreed,
      size: dogSize,
      notes: dogNotes || null,
      ownerId: owner.id,
    },
  });

  // Crear la cita
  const appointment = await prisma.appointment.create({
    data: {
      date: appointmentDate,
      status: "PENDING",
      serviceId: service.id,
      dogId: dog.id,
      notes: dogNotes || null,
    },
    select: { id: true, date: true, status: true },
  });

  // Notificación email (fire & forget — no bloquea la respuesta)
  const [dd, mm, yy] = [
    String(day).padStart(2, "0"),
    String(month).padStart(2, "0"),
    year,
  ];
  sendNewAppointmentEmail({
    ownerName,
    ownerPhone,
    ownerEmail: ownerEmail || "",
    dogName,
    dogBreed,
    dogSize,
    serviceName: service.name,
    date: `${dd}/${mm}/${yy}`,
    time,
    notes: dogNotes,
  }).catch(() => {
    /* silencioso si email no configurado */
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
