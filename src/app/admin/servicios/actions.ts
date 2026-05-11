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
  description: z.string().max(3000).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  calComLink: z.string().max(255).optional().nullable(),
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
      categoryId: (formData.get("categoryId") as string) || null,
      calComLink: (formData.get("calComLink") as string) || null,
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
      categoryId: (formData.get("categoryId") as string) || null,
      calComLink: (formData.get("calComLink") as string) || null,
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

export type DeleteServiceResult = { success: true } | { error: string };

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

// --- CATEGORY ACTIONS ---

const CategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(3000).optional().nullable(),
  order: z.coerce.number().int().min(0).default(0),
});

export type CategoryFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    order?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      order: Number(formData.get("order") || 0),
    };

    const parsed = CategorySchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.serviceCategory.create({ data: parsed.data });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return {
      errors: { _form: ["Error al crear la categoría. Intenta de nuevo."] },
    };
  }
}

export async function updateCategoryAction(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      order: Number(formData.get("order") || 0),
    };

    const parsed = CategorySchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.serviceCategory.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { errors: { _form: ["Error al actualizar la categoría."] } };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    // Guard: no permitir eliminar si tiene servicios activos
    const activeServicesCount = await prisma.service.count({
      where: { categoryId: id, isActive: true },
    });

    if (activeServicesCount > 0) {
      return {
        error: `No se puede eliminar: tiene ${activeServicesCount} servicio(s) activo(s). Desactiva o mueve los servicios primero.`,
      };
    }

    await prisma.serviceCategory.delete({ where: { id } });
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Error al eliminar la categoría." };
  }
}
