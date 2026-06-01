"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendReviewRequestEmail } from "@/lib/email";
import { env } from "@/env";
import { after } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

const StatusSchema = z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]);

export type UpdateStatusState = {
  errors?: { _form?: string[] };
  success?: boolean;
};

// Firma: updateAppointmentStatusAction(id, status, prevState)
// Cambia el estado de la cita con el id dado.
// Llama revalidatePath para /admin/agenda y /admin/citas y /admin.
export async function updateAppointmentStatusAction(
  id: string,
  status: string,
  _prevState: UpdateStatusState,
): Promise<UpdateStatusState> {
  try {
    await requireAdmin();
    const parsed = StatusSchema.safeParse(status);
    if (!parsed.success) {
      return { errors: { _form: ["Estado inválido"] } };
    }
    await prisma.appointment.update({
      where: { id },
      data: { status: parsed.data },
    });
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al actualizar el estado."] } };
  }
}

interface MarkDoneInput {
  service: string;
  notes: string | null;
  photos: string[];
}

export type MarkDoneState = {
  errors?: { _form?: string[] };
  success?: boolean;
};

export async function markDoneWithAttendanceAction(
  appointmentId: string,
  input: MarkDoneInput | null,
  sendReviewLink: boolean,
): Promise<MarkDoneState> {
  try {
    await requireAdmin();

    if (input && (!input.service || input.service.trim().length === 0)) {
      return { errors: { _form: ["El nombre del servicio es obligatorio"] } };
    }

    // Validar que las URLs de fotos sean de Cloudinary
    const validPhotos =
      input?.photos.filter((url) =>
        url.startsWith("https://res.cloudinary.com/"),
      ) ?? [];

    // Buscar la cita para obtener dogId y datos del dueño
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        dogId: true,
        date: true,
        dog: {
          select: {
            name: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!appointment) {
      return { errors: { _form: ["Cita no encontrada"] } };
    }

    // Transacción: cambiar estado + crear registro de atención (si existe input)
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "DONE" },
      });

      if (input) {
        await tx.attendance.create({
          data: {
            service: input.service.trim(),
            date: appointment.date,
            notes: input.notes,
            photos: validPhotos,
            dogId: appointment.dogId,
          },
        });
      }
    });

    // Crear reseña y enviar email si se solicitó y el dueño tiene email
    if (sendReviewLink) {
      const ownerEmail = appointment.dog.owner.email;
      if (ownerEmail) {
        const review = await prisma.review.create({
          data: {
            ownerName: appointment.dog.owner.name,
            petName: appointment.dog.name,
            appointmentId,
          },
        });

        const baseUrl = env.APP_URL ?? env.NEXTAUTH_URL ?? "";
        const reviewUrl = `${baseUrl}/resena/${review.token}`;

        // Fire-and-forget — no bloquear la respuesta
        void sendReviewRequestEmail(ownerEmail, {
          ownerName: appointment.dog.owner.name,
          petName: appointment.dog.name,
          reviewUrl,
        });
      }
    }

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[admin] Error en markDoneWithAttendanceAction:", error);
    return { errors: { _form: ["Error al guardar. Intenta de nuevo."] } };
  }
}

export type ToggleWhatsappState = {
  errors?: { _form?: string[] };
  success?: boolean;
};

export async function toggleWhatsappSentAction(
  id: string,
  sent: boolean,
): Promise<ToggleWhatsappState> {
  try {
    await requireAdmin();
    // Actualizamos con la fecha actual o null según el parámetro `sent`
    await prisma.appointment.update({
      where: { id },
      data: { whatsappSentAt: sent ? new Date() : null },
    });
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al actualizar estado de WhatsApp."] } };
  }
}

const ManualAppointmentSchema = z.object({
  dogId: z.string().min(1, "Selecciona una mascota"),
  serviceId: z.string().min(1, "Selecciona un servicio"),
  date: z.coerce.date(),
  status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]),
  notes: z.string().max(1000).optional().nullable(),
});

export type ManualAppointmentFormState = {
  errors?: {
    dogId?: string[];
    serviceId?: string[];
    date?: string[];
    status?: string[];
    notes?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createManualAppointmentAction(
  _prev: ManualAppointmentFormState,
  formData: FormData,
): Promise<ManualAppointmentFormState> {
  try {
    await requireAdmin();
    const raw = {
      dogId: formData.get("dogId") as string,
      serviceId: formData.get("serviceId") as string,
      date: formData.get("date") as string,
      status: formData.get("status") as string,
      notes: (formData.get("notes") as string) || null,
    };

    const parsed = ManualAppointmentSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        dogId: parsed.data.dogId,
        serviceId: parsed.data.serviceId,
        date: parsed.data.date,
        status: parsed.data.status,
        notes: parsed.data.notes,
      },
    });

    // Intentar sincronizar con Cal.com (fire-and-forget seguro usando after)
    if (env.CALCOM_API_KEY) {
      after(async () => {
        console.info("[admin] Iniciando sincronización con Cal.com...");
        try {
          // 1. Obtener datos del servicio y del dueño
          const [service, dog] = await Promise.all([
            prisma.service.findUnique({
              where: { id: parsed.data.serviceId },
              select: { name: true, calComLink: true },
            }),
            prisma.dog.findUnique({
              where: { id: parsed.data.dogId },
              select: {
                name: true,
                breed: true,
                age: true,
                weight: true,
                owner: { select: { name: true, email: true, phone: true } },
              },
            }),
          ]);

          if (service?.calComLink) {
            // 2. Parsear calComLink (puede ser URL completa o "username/slug")
            let calPath = service.calComLink;
            try {
              calPath = new URL(service.calComLink).pathname.replace(/^\//, "");
            } catch { /* ya es "username/slug" */ }

            const parts = calPath.split("/");
            if (parts.length >= 2) {
              const username = parts[0];
              const eventTypeSlug = parts.slice(1).join("/");

              // Formatear el teléfono de manera segura para Cal.com
              const rawPhone = dog?.owner.phone ?? "";
              const formattedPhone = rawPhone
                ? (rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`)
                : "";

              // 3. Construir payload para Cal.com
              const payload = {
                start: parsed.data.date.toISOString(),
                eventTypeSlug,
                username,
                attendee: {
                  name: dog?.owner.name ?? "Cliente",
                  email: dog?.owner.email ?? "petitsalon.contacto@gmail.com",
                  timeZone: "America/Santiago",
                  language: "es",
                  phoneNumber: formattedPhone,
                },
                bookingFieldsResponses: {
                  servicio: service.name || "Servicio",
                  nombre_perro: dog?.name || "Sin nombre",
                  edad: dog?.age || "No especificada",
                  raza_perro: dog?.breed || "Sin raza",
                  peso: dog?.weight || "No especificado",
                  telefono: formattedPhone,
                  attendeePhoneNumber: formattedPhone,
                },
                metadata: {
                  source: "admin-manual",
                  appointmentId: newAppointment.id,
                },
              };

              const calRes = await fetch("https://api.cal.com/v2/bookings", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${env.CALCOM_API_KEY}`,
                  "cal-api-version": "2024-08-13",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(8000),
              });

              if (calRes.ok) {
                const calJson = (await calRes.json()) as {
                  status: string;
                  data?: { uid?: string };
                };
                if (calJson.status === "success" && calJson.data?.uid) {
                  // 4. Guardar el uid en nuestra DB para idempotencia
                  await prisma.appointment.update({
                    where: { id: newAppointment.id },
                    data: { calComUid: calJson.data.uid },
                  });
                  console.info(
                    `[admin] Cita manual sincronizada con Cal.com. ID cita: ${newAppointment.id}, UID: ${calJson.data.uid}`,
                  );
                } else {
                  console.error(
                    `[admin] Cal.com respondió con éxito pero sin UID de booking:`,
                    JSON.stringify(calJson),
                  );
                }
              } else {
                const errText = await calRes.text();
                console.error(
                  `[admin] Error en Cal.com booking API (${calRes.status}): ${errText}`,
                );
              }
            }
          }
        } catch (calError) {
          console.error(
            `[admin] Excepción al sincronizar con Cal.com para cita ${newAppointment.id}:`,
            calError,
          );
        }
      });
    }

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al crear la cita manual"] } };
  }
}

