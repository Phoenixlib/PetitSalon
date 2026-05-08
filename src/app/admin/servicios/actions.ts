"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ServiceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  price: z.coerce
    .number()
    .int("El precio debe ser un entero (CLP)")
    .min(0, "El precio no puede ser negativo"),
  duration: z.coerce.number().int().min(5, "Mínimo 5 minutos"),
  description: z.string().max(500).optional().nullable(),
});

export type ServiceFormState = {
  errors?: {
    name?: string[];
    price?: string[];
    duration?: string[];
    description?: string[];
    _form?: string[];
  };
  success?: boolean;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      description: (formData.get("description") as string) || null,
    };

    const parsed = ServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.service.create({ data: parsed.data });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return {
      errors: { _form: ["Error al crear el servicio. Intenta de nuevo."] },
    };
  }
}

export async function updateServiceAction(
  id: string,
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      description: (formData.get("description") as string) || null,
    };

    const parsed = ServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.service.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al actualizar el servicio."] } };
  }
}

export async function toggleServiceAction(
  id: string,
  isActive: boolean,
): Promise<void> {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/servicios");
  revalidatePath("/");
}

export type DeleteServiceResult =
  | { success: true }
  | { error: string };

export async function deleteServiceAction(
  id: string,
): Promise<DeleteServiceResult> {
  try {
    await requireAdmin();

    // Guard: no permitir eliminar si tiene citas asociadas
    const appointmentsCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentsCount > 0) {
      return {
        error: `No se puede eliminar: tiene ${appointmentsCount} cita${appointmentsCount > 1 ? "s" : ""} asociada${appointmentsCount > 1 ? "s" : ""}. Desactívalo en su lugar.`,
      };
    }

    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el servicio." };
  }
}
