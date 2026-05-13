"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  input: MarkDoneInput,
): Promise<MarkDoneState> {
  try {
    await requireAdmin();

    if (!input.service || input.service.trim().length === 0) {
      return { errors: { _form: ["El nombre del servicio es obligatorio"] } };
    }

    // Validar que las URLs de fotos sean de Cloudinary
    const validPhotos = input.photos.filter((url) =>
      url.startsWith("https://res.cloudinary.com/"),
    );

    // Buscar la cita para obtener dogId
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { dogId: true, date: true },
    });

    if (!appointment) {
      return { errors: { _form: ["Cita no encontrada"] } };
    }

    // Transacción: cambiar estado + crear registro de atención
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "DONE" },
      }),
      prisma.attendance.create({
        data: {
          service: input.service.trim(),
          date: appointment.date,
          notes: input.notes,
          photos: validPhotos,
          dogId: appointment.dogId,
        },
      }),
    ]);

    revalidatePath("/admin/agenda");
    revalidatePath("/admin/citas");
    revalidatePath("/admin");

    return { success: true };
  } catch {
    return { errors: { _form: ["Error al guardar. Intenta de nuevo."] } };
  }
}
