import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import {
  sendWhatsAppConfirmation,
  sendWhatsAppTodayReminder,
} from "@/lib/twilio";

const DOG_SIZE_VALUES: readonly string[] = ["XS", "S", "M", "L", "XL"];

function parseDogSize(value: string | undefined | null): string | null {
  if (!value) return null;
  const upper = String(value).toUpperCase().trim();
  if (DOG_SIZE_VALUES.includes(upper)) return upper;

  // Buscar si empieza con la letra o tiene el formato "S - Pequeño"
  for (const size of ["XL", "XS", "L", "M", "S"]) {
    // Orden importa (XL antes de L)
    const regex = new RegExp(`(^|\\s|\\()${size}(\\s|-|\\)|$)`);
    if (regex.test(upper)) return size;
  }

  return null;
}

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
  // "Teléfono" con slug "attendeePhoneNumber"
  attendeePhoneNumber?: { value: string };
  // "Tamaño" con slug "dog_size" — valores: XS, S, M, L, XL
  dog_size?: { value: string };
  // "Notas del perro" con slug "dog_notes" — alergias, temperamento, etc.
  dog_notes?: { value: string };
  // "Edad" con slug "edad"
  edad?: { value: string };
  // "Peso" con slug "peso"
  peso?: { value: string };
  // "Servicio Específico" con slug "servicio" (para pasarlo por parámetro)
  servicio?: { value: string };
  notes?: { value: string };
  [key: string]: { value: any; label?: string } | undefined;
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
    | "RSVP_SENT"
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

  const computedHash = crypto
    .createHmac("sha256", env.CALCOM_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expected = `sha256=${computedHash}`;
  const cleanSignature = signature.replace(/^sha256=/, "");

  const signatureBuffer = Buffer.from(cleanSignature);
  const expectedBuffer = Buffer.from(computedHash);

  if (signatureBuffer.length !== expectedBuffer.length) {
    console.error(
      `[calcom-webhook] Signature length mismatch. Received clean length: ${cleanSignature.length}, Expected: ${computedHash.length}`,
    );
    return false;
  }

  // Comparación de tiempo constante para evitar timing attacks
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

// ---------------------------------------------------------------------------
// Lógica de upsert
// ---------------------------------------------------------------------------

async function handleBookingCreated(payload: CalComBookingPayload) {
  // 1. Verificar si viene metadata con appointmentId (cita creada por admin)
  const appointmentIdFromMetadata = payload.metadata?.appointmentId;
  if (appointmentIdFromMetadata) {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentIdFromMetadata },
    });
    if (existingAppointment) {
      if (existingAppointment.calComUid !== payload.uid) {
        await prisma.appointment.update({
          where: { id: appointmentIdFromMetadata },
          data: { calComUid: payload.uid },
        });
        console.info(
          `[calcom-webhook] Cita manual sincronizada con calComUid ${payload.uid} desde metadata.`,
        );
      } else {
        console.info(
          `[calcom-webhook] Cita manual ya sincronizada con calComUid ${payload.uid}.`,
        );
      }
      return;
    }
  }

  // 2. Fallback: Verificar si la cita ya existe por su calComUid
  const existingByUid = await prisma.appointment.findUnique({
    where: { calComUid: payload.uid },
  });
  if (existingByUid) {
    console.info(
      `[calcom-webhook] Cita ya existe en la base de datos con calComUid ${payload.uid}. Omitiendo creación duplicada.`,
    );
    return;
  }

  const attendee = payload.attendees[0];
  if (!attendee) throw new Error("Reserva sin asistente");

  const responses = payload.responses ?? {};
  let ownerName = attendee.name;
  let ownerEmail = attendee.email ?? null;
  let ownerPhone = attendee.phoneNumber ?? "";
  let dogName = "Sin nombre";
  let dogBreed = "Sin raza";
  let dogSizeRaw: string | null = null;
  let dogNotes: string | null = null;
  let dogAge: string | null = null;
  let dogWeight: string | null = null;
  let passedService: string | null = null;
  let notes: string | null = null;

  for (const [key, field] of Object.entries(responses)) {
    let val = "";
    let label = "";

    if (field && typeof field === "object" && "value" in field) {
      if (typeof field.value === "string" || typeof field.value === "number") {
        val = String(field.value).trim();
        label = (field as any).label?.toLowerCase() ?? "";
      }
    } else if (typeof field === "string" || typeof field === "number") {
      val = String(field).trim();
    }

    if (!val) continue;
    const k = key.toLowerCase();
    const isMatch = (term: string) => k.includes(term) || label.includes(term);

    if (
      isMatch("nombre_perro") ||
      isMatch("nombre del perro") ||
      k === "perro" ||
      label === "perro"
    ) {
      dogName = val;
    } else if (isMatch("raza")) {
      dogBreed = val;
    } else if (isMatch("tamaño") || isMatch("tamano") || isMatch("size")) {
      dogSizeRaw = val;
    } else if (isMatch("peso") || isMatch("weight")) {
      dogWeight = val;
    } else if (isMatch("edad") || isMatch("age")) {
      dogAge = val;
    } else if (
      isMatch("dog_notes") ||
      isMatch("alergia") ||
      isMatch("temperamento")
    ) {
      dogNotes = val;
    } else if (isMatch("servicio")) {
      passedService = val;
    } else if (isMatch("tel") || isMatch("phone") || isMatch("whatsapp")) {
      ownerPhone = val;
    } else if (isMatch("email") || isMatch("correo")) {
      ownerEmail = val;
    } else if (isMatch("notes") || isMatch("notas")) {
      notes = val;
    } else if (
      k === "name" ||
      k === "nombre" ||
      label === "nombre completo" ||
      label === "nombre"
    ) {
      ownerName = val;
    }
  }

  const dogSize = parseDogSize(dogSizeRaw);

  // 1. Upsert Service
  let service = null;

  if (passedService) {
    // Si viene el nombre del servicio desde el formulario/url, búscalo exactamente así
    service = await prisma.service.findFirst({
      where: {
        name: { equals: passedService, mode: "insensitive" },
        isActive: true,
      },
    });
  }

  if (!service) {
    // Fallback: Busca por nombre del evento de cal.com o por el link
    service = await prisma.service.findFirst({
      where: {
        OR: [
          { name: { contains: payload.title, mode: "insensitive" } },
          { calComLink: { contains: payload.title, mode: "insensitive" } },
        ],
        isActive: true,
      },
    });
  }

  if (!service) {
    // Fallback absoluto al primer servicio activo si no hay coincidencia exacta
    service = await prisma.service.findFirst({ where: { isActive: true } });
  }
  if (!service)
    throw new Error("No hay servicios configurados en la base de datos");

  // 2. Upsert Owner resiliente
  let owner = null;

  // Buscar primero por email si viene
  if (ownerEmail) {
    owner = await prisma.owner.findUnique({ where: { email: ownerEmail } });
  }

  // Si no se encuentra por email, buscar por teléfono si viene
  if (!owner && ownerPhone) {
    owner = await prisma.owner.findUnique({ where: { phone: ownerPhone } });
  }

  if (!owner) {
    try {
      owner = await prisma.owner.create({
        data: { name: ownerName, email: ownerEmail, phone: ownerPhone },
      });
    } catch (createErr: any) {
      console.warn(
        "[calcom-webhook] Error al crear dueño, reintentando recuperar por colisión:",
        createErr.message,
      );
      // Si falló por restricción de unicidad, intentamos recuperarlo por email o teléfono nuevamente
      if (ownerEmail) {
        owner = await prisma.owner.findUnique({ where: { email: ownerEmail } });
      }
      if (!owner && ownerPhone) {
        owner = await prisma.owner.findUnique({ where: { phone: ownerPhone } });
      }
      // Si aún así no existe (raro), creamos un dueño temporal sin datos únicos para que no falle la cita
      if (!owner) {
        owner = await prisma.owner.create({
          data: {
            name: ownerName,
            phone: ownerPhone || `fallback-${Date.now()}`,
          },
        });
      }
    }
  } else {
    // Si existe, intentar actualizar los campos faltantes de forma segura (sin pisar campos únicos de otros dueños)
    try {
      owner = await prisma.owner.update({
        where: { id: owner.id },
        data: {
          ...(ownerPhone && !owner.phone ? { phone: ownerPhone } : {}),
          ...(ownerEmail && !owner.email ? { email: ownerEmail } : {}),
        },
      });
    } catch (updateErr: any) {
      console.warn(
        "[calcom-webhook] Conflicto de unicidad al actualizar dueño (ignorado para no bloquear la cita):",
        updateErr.message,
      );
      // No lanzamos el error para que continúe la ejecución y se guarde la cita
    }
  }

  // 3. Upsert Dog por nombre dentro del mismo owner de forma segura
  let dog = await prisma.dog.findFirst({
    where: {
      ownerId: owner.id,
      name: { equals: dogName, mode: "insensitive" },
    },
  });

  if (!dog) {
    try {
      dog = await prisma.dog.create({
        data: {
          name: dogName,
          breed: dogBreed,
          ownerId: owner.id,
          ...(dogAge !== null && { age: dogAge }),
          ...(dogWeight !== null && { weight: dogWeight }),
          ...(dogNotes !== null && { notes: dogNotes }),
        },
      });
    } catch (dogCreateErr: any) {
      console.warn(
        "[calcom-webhook] Error al crear mascota, reintentando recuperar:",
        dogCreateErr.message,
      );
      // Recuperar de todos modos si ya existe en la base de datos
      dog = await prisma.dog.findFirst({
        where: {
          ownerId: owner.id,
          name: { equals: dogName, mode: "insensitive" },
        },
      });
      if (!dog) {
        // Crear de forma minimalista para no bloquear la cita
        dog = await prisma.dog.create({
          data: { name: dogName, ownerId: owner.id, breed: dogBreed },
        });
      }
    }
  } else {
    try {
      dog = await prisma.dog.update({
        where: { id: dog.id },
        data: {
          ...(dogBreed && dogBreed !== "Sin raza" ? { breed: dogBreed } : {}),
          ...(dogAge ? { age: dogAge } : {}),
          ...(dogWeight ? { weight: dogWeight } : {}),
          ...(dogNotes ? { notes: dogNotes } : {}),
        },
      });
    } catch (dogUpdateErr: any) {
      console.warn(
        "[calcom-webhook] Error al actualizar mascota (ignorado para no bloquear la cita):",
        dogUpdateErr.message,
      );
    }
  }

  // 4. Crear Appointment (idempotente vía calComUid) de forma segura con logs detallados
  try {
    const appointment = await prisma.appointment.upsert({
      where: { calComUid: payload.uid },
      create: {
        calComUid: payload.uid,
        date: new Date(payload.startTime),
        status: "PENDING",
        serviceId: service.id,
        dogId: dog.id,
        notes: notes,
      },
      update: {
        date: new Date(payload.startTime),
      },
    });
    console.info(
      `[calcom-webhook] Cita procesada exitosamente en la base de datos. ID: ${appointment.id}`,
    );

    // Enviar notificación de confirmación por WhatsApp (opcional/mejor esfuerzo)
    if (owner.phone) {
      const appDate = new Date(payload.startTime);
      const dateStr = appDate.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const timeStr = appDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // WhatsApp deshabilitado temporalmente para evitar cargos/spam no deseado en lanzamiento
      /*
      await sendWhatsAppConfirmation(owner.phone, {
        ownerName: owner.name,
        petName: dog.name,
        dateStr,
        timeStr,
      }).catch((e) => console.error("[calcom-webhook] WhatsApp fail:", e));
      */
    }
  } catch (appErr: any) {
    console.error(
      "[calcom-webhook] Error crítico al insertar/actualizar la cita en la base de datos:",
      appErr,
    );
    throw appErr; // Lanzamos este error ya que si la cita no se puede crear, queremos que Cal.com sepa del fallo
  }
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

/**
 * Maneja eventos de recordatorio enviados por Cal.com.
 * Cal.com puede configurarse para disparar webhooks en sus propios recordatorios.
 */
async function handleReminderEvent(payload: CalComBookingPayload) {
  const attendee = payload.attendees[0];
  if (!attendee || !attendee.phoneNumber) return;

  const appDate = new Date(payload.startTime);
  const now = new Date();

  // Si la cita es hoy, enviamos el mensaje de "hoy es el día"
  if (appDate.toDateString() === now.toDateString()) {
    const timeStr = appDate.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Intentamos recuperar el nombre del perro desde el payload o DB
    const appointment = await prisma.appointment.findUnique({
      where: { calComUid: payload.uid },
      include: { dog: true },
    });

    const dogName = appointment?.dog.name || "tu mascota";

    /*
    await sendWhatsAppTodayReminder(attendee.phoneNumber, {
      ownerName: attendee.name,
      petName: dogName,
      dateStr: "hoy",
      timeStr,
    }).catch((e) => console.error("[calcom-webhook] WhatsApp Today fail:", e));
    */
  }
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
    console.log(
      `[calcom-webhook] Event: ${body.triggerEvent}, UID: ${body.payload?.uid}`,
    );
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
      case "RSVP_SENT": // Cal.com a veces usa este para notificaciones enviadas
        await handleReminderEvent(body.payload);
        break;
      default:
        // Manejar otros eventos de recordatorio si el slug los incluye
        if (body.triggerEvent.includes("REMINDER")) {
          await handleReminderEvent(body.payload);
        } else {
          console.info(
            `[calcom-webhook] Evento ignorado: ${body.triggerEvent}`,
          );
        }
    }

    // Revalidar las rutas del panel administrativo para borrar la caché
    revalidatePath("/admin");
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin/clientes");
    revalidatePath("/admin/perros");
  } catch (err) {
    console.error("[calcom-webhook] Error procesando evento:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
