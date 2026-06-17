"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseIncomingDate } from "@/lib/date-utils";
import { sendReviewRequestEmail } from "@/lib/email";
import { env } from "@/env";
import { createCalComBooking, cancelCalComBooking, rescheduleCalComBooking } from "@/lib/calcom";
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

    // Obtener la cita actual para verificar calComUid
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return { errors: { _form: ["Cita no encontrada"] } };
    }

    // Si se está cancelando y tiene un UID de Cal.com, intentar cancelar en Cal.com
    if (parsed.data === "CANCELLED" && appointment.calComUid) {
      try {
        await cancelCalComBooking(appointment.calComUid, "Cancelada desde el panel de administración");
      } catch (calError) {
        // En lugar de retornar error y bloquear la cancelación local, 
        // simplemente registramos el error y permitimos que la DB local se actualice.
        console.warn("[admin] Advertencia: Error cancelando en Cal.com (forzando cancelación local):", calError);
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: parsed.data },
    });
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[admin] Error en updateAppointmentStatusAction:", error);
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
  date: z.preprocess((val) => parseIncomingDate(val), z.date()),
  status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]),
  notes: z.string().max(1000).optional().nullable(),
  newOwnerName: z.string().optional(),
  newOwnerPhone: z.string().optional(),
  newOwnerEmail: z.string().optional(),
  newDogName: z.string().optional(),
  newDogBreed: z.string().optional(),
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
  waLink?: string;
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
      newOwnerName: (formData.get("newOwnerName") as string) || undefined,
      newOwnerPhone: (formData.get("newOwnerPhone") as string) || undefined,
      newOwnerEmail: (formData.get("newOwnerEmail") as string) || undefined,
      newDogName: (formData.get("newDogName") as string) || undefined,
      newDogBreed: (formData.get("newDogBreed") as string) || undefined,
    };

    const parsed = ManualAppointmentSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    let dogId = parsed.data.dogId;
    let ownerPhone = "";
    let ownerName = "";
    let dogName = "";

    if (dogId === "new") {
      if (!parsed.data.newOwnerName || !parsed.data.newOwnerPhone || !parsed.data.newDogName || !parsed.data.newDogBreed) {
        return { errors: { _form: ["Faltan datos del nuevo cliente o mascota."] } };
      }
      const newOwner = await prisma.owner.create({
        data: {
          name: parsed.data.newOwnerName,
          phone: parsed.data.newOwnerPhone,
          email: parsed.data.newOwnerEmail || null,
          dogs: {
            create: {
              name: parsed.data.newDogName,
              breed: parsed.data.newDogBreed,
            }
          }
        },
        include: { dogs: true }
      });
      dogId = newOwner.dogs[0].id;
      ownerPhone = newOwner.phone;
      ownerName = newOwner.name;
      dogName = newOwner.dogs[0].name;
    } else {
      const dog = await prisma.dog.findUnique({ where: { id: dogId }, include: { owner: true } });
      if (dog) {
        ownerPhone = dog.owner.phone;
        ownerName = dog.owner.name;
        dogName = dog.name;
      }
    }

    const allowOverbooking = formData.get("allowOverbooking") === "true";

    const newAppointment = await prisma.appointment.create({
      data: {
        dogId: dogId,
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
              select: { name: true, calComLink: true, calComEventTypeId: true, calComOverbookingEventTypeId: true },
            }),
            prisma.dog.findUnique({
              where: { id: parsed.data.dogId },
              select: {
                name: true,
                breed: true,
                age: true,
                weight: true,
                notes: true,
                owner: { select: { name: true, email: true, phone: true } },
              },
            }),
          ]);

          if (service?.calComEventTypeId) {
            // 3. Construir payload para Cal.com
            const customFields = {
              servicio: service.name || "Servicio",
              nombre_perro: dog?.name || "Sin nombre",
              edad: dog?.age || "No especificada",
              raza_perro: dog?.breed || "Sin raza",
              peso: dog?.weight || "No especificado",
              dog_size: "No especificado",
              dog_notes: parsed.data.notes || dog?.notes || "",
            };

            // Formatear el teléfono de manera segura para Cal.com (formato chileno)
            const rawPhone = dog?.owner.phone ?? "";
            let formattedPhone = "";
            if (rawPhone) {
              const clean = rawPhone.replace(/[^\d]/g, ""); // Extraer solo dígitos
              if (clean.length === 8) {
                // Ej: 12345678 -> +56912345678
                formattedPhone = `+569${clean}`;
              } else if (clean.length === 9 && clean.startsWith("9")) {
                // Ej: 912345678 -> +56912345678
                formattedPhone = `+56${clean}`;
              } else if (clean.length === 11 && clean.startsWith("56")) {
                // Ej: 56912345678 -> +56912345678
                formattedPhone = `+${clean}`;
              } else {
                // Fallback: agregar '+' si no lo tiene
                formattedPhone = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
              }

              // Actualizar el número en la base de datos si logramos corregirlo
              if (dog?.owner && formattedPhone !== rawPhone && formattedPhone.startsWith("+569") && formattedPhone.length === 12) {
                try {
                  await prisma.owner.updateMany({
                    where: { email: dog.owner.email, name: dog.owner.name },
                    data: { phone: formattedPhone },
                  });
                  console.info(`[admin] Teléfono de cliente corregido en DB de ${rawPhone} a ${formattedPhone}`);
                } catch (e) {
                  console.error("[admin] No se pudo actualizar el teléfono corregido en DB:", e);
                }
              }
            }

            let calRes = null;
            const useFallbackDirectly = allowOverbooking && !!service.calComOverbookingEventTypeId;

            if (useFallbackDirectly && service.calComOverbookingEventTypeId) {
              console.info(
                `[admin] Cita marcada como sobrecupo. Reservando directamente en evento de respaldo ID: ${service.calComOverbookingEventTypeId}`
              );
              try {
                calRes = await createCalComBooking(
                  service.calComOverbookingEventTypeId,
                  parsed.data.date.toISOString(),
                  dog?.owner.name ?? "Cliente",
                  dog?.owner.email ?? "petitsalon.contacto@gmail.com",
                  formattedPhone,
                  customFields
                );
              } catch (fallbackError) {
                console.error(
                  `[admin] Excepción en reserva de sobrecupo directa (ID: ${service.calComOverbookingEventTypeId}):`,
                  fallbackError
                );
              }
            } else {
              console.info(
                `[admin] Reservando en evento principal ID: ${service.calComEventTypeId}`
              );
              try {
                calRes = await createCalComBooking(
                  service.calComEventTypeId,
                  parsed.data.date.toISOString(),
                  dog?.owner.name ?? "Cliente",
                  dog?.owner.email ?? "petitsalon.contacto@gmail.com",
                  formattedPhone,
                  customFields
                );
              } catch (primaryError) {
                console.warn(
                  `[admin] Error en reserva principal Cal.com (ID: ${service.calComEventTypeId}):`,
                  primaryError
                );
              }

              // 3.1 Intentar fallback (sobrecupo) si falla la reserva principal y hay ID configurado
              if ((!calRes || calRes.status !== "success") && service.calComOverbookingEventTypeId) {
                console.info(
                  `[admin] Reserva principal fallida o rechazada. Intentando sobrecupo en evento de respaldo ID: ${service.calComOverbookingEventTypeId}`
                );
                try {
                  calRes = await createCalComBooking(
                    service.calComOverbookingEventTypeId,
                    parsed.data.date.toISOString(),
                    dog?.owner.name ?? "Cliente",
                    dog?.owner.email ?? "petitsalon.contacto@gmail.com",
                    formattedPhone,
                    customFields
                  );
                } catch (fallbackError) {
                  console.error(
                    `[admin] Excepción en reserva de sobrecupo secundaria (ID: ${service.calComOverbookingEventTypeId}):`,
                    fallbackError
                  );
                }
              }
            }

            if (calRes && calRes.status === "success" && calRes.data?.uid) {
              // 4. Guardar el uid en nuestra DB para idempotencia
              await prisma.appointment.update({
                where: { id: newAppointment.id },
                data: { calComUid: calRes.data.uid },
              });
              console.info(
                `[admin] Cita manual sincronizada con Cal.com. ID cita: ${newAppointment.id}, UID: ${calRes.data.uid}`,
              );
            } else {
              console.error(
                `[admin] Error en Cal.com booking API o sin UID de booking:`,
                JSON.stringify(calRes),
              );
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

    const getCleanPhone = (phone: string) => {
      let p = phone.replace(/[^\d+]/g, '');
      if (p.startsWith('9') && p.length === 8) p = '+569' + p;
      else if (p.startsWith('9') && p.length === 9) p = '+56' + p;
      else if (!p.startsWith('+')) p = '+' + p;
      return p;
    };

    let waLink: string | undefined;
    try {
      const serviceObj = await prisma.service.findUnique({ where: { id: parsed.data.serviceId } });
      const serviceName = serviceObj?.name || "Servicio";
      const dateObj = new Date(parsed.data.date);
      const cleanPhone = getCleanPhone(ownerPhone);
      const formattedDateStr = dateObj.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
      const formattedTimeStr = dateObj.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

      const waMessage = `Hola ${ownerName}, te escribo de Petitsalon para confirmarte que la cita para *${dogName}* (${serviceName}) ha sido agendada con éxito.\n\n*Detalles de la cita:*\n📅 *Fecha:* ${formattedDateStr}\n⏰ *Hora:* ${formattedTimeStr} hrs\n📍 *Ubicación:* Manuel Rodriguez 1993, Iquique\n\n¡Te esperamos!`;
      waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}` : undefined;
    } catch (e) {
      console.error("Error generating waLink:", e);
    }

    return { success: true, waLink };
  } catch (error) {
    console.error("[admin] Error en createManualAppointmentAction:", error);
    return { errors: { _form: ["Error al crear la cita manual"] } };
  }
}

export type RescheduleAppointmentState = {
  errors?: { _form?: string[] };
  success?: boolean;
};

export async function rescheduleAppointmentAction(
  id: string,
  newDateIso: string,
  _prevState: RescheduleAppointmentState
): Promise<RescheduleAppointmentState> {
  try {
    await requireAdmin();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return { errors: { _form: ["Cita no encontrada."] } };
    }

    const newDate = parseIncomingDate(newDateIso);
    if (isNaN(newDate.getTime())) {
      return { errors: { _form: ["Fecha inválida."] } };
    }

    // Si tiene un UID de Cal.com, reagendar externamente
    if (appointment.calComUid) {
      try {
        const calRes = await rescheduleCalComBooking(appointment.calComUid, newDate);
        if (!calRes || calRes.status !== "success") {
          return { errors: { _form: ["No se pudo reagendar en Cal.com."] } };
        }
      } catch (calError: any) {
        console.error(`[admin] Error reagendando cita ${id} en Cal.com:`, calError);
        let errorMsg = calError instanceof Error ? calError.message : "Error de conexión con Cal.com al reagendar.";

        if (errorMsg === "User either already has booking at this time or is not available") {
          errorMsg = "Horario no disponible. Ya existe una reserva o el horario está bloqueado en Cal.com.";
        }

        return { errors: { _form: [errorMsg] } };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: { date: newDate },
    });

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[admin] Error en rescheduleAppointmentAction:", error);
    return { errors: { _form: ["Error al reagendar la cita."] } };
  }
}

