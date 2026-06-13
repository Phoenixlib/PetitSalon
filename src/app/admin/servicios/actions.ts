"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCalComEventType, updateCalComEventType, deleteCalComEventType, getCalComEventTypes } from "@/lib/calcom";
import { env } from "@/env";

const ServiceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  price: z.coerce
    .number()
    .int("El precio debe ser un entero (CLP)")
    .min(0, "El precio no puede ser negativo"),
  duration: z.coerce.number().int().min(5, "Mínimo 5 minutos"),
  description: z.string().max(3000).optional().nullable(),
  categoryId: z.string().optional().nullable(),
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
    };

    const parsed = ServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    let calComEventTypeId: number | null = null;
    let calComOverbookingEventTypeId: number | null = null;
    let calComLink: string | null = null;
    let calComSlug: string | null = null;

    const siteConfig = await prisma.siteConfig.findUnique({ where: { key: "address" } });
    const address = siteConfig?.value || "Carvajal 0330, La Cisterna";

    // Siempre intentar buscar si el event type ya existe en Cal.com por slug
    const slug = parsed.data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (slug) {
      try {
        const eventTypes = await getCalComEventTypes();
        if (eventTypes) {
          const match = eventTypes.find(e => e.slug === slug);
          if (match) {
            calComEventTypeId = match.id;
            calComSlug = match.slug;
            calComLink = match.bookingUrl || null;
          }
          
          const overbookingMatch = eventTypes.find(e => e.slug === `${slug}-sobrecupo`);
          if (overbookingMatch) {
            calComOverbookingEventTypeId = overbookingMatch.id;
          }
        }
      } catch (e) {
        console.error("Failed to match event type by slug:", e);
      }
    }

    // --- MAIN EVENT TYPE ---
    if (calComEventTypeId) {
      // Si logramos enlazarlo a uno existente, lo actualizamos con los datos del formulario
      try {
        const calEvent = await updateCalComEventType(
          calComEventTypeId,
          parsed.data.name,
          parsed.data.duration,
          parsed.data.description || undefined,
          address
        );
        if (calEvent) {
          calComSlug = calEvent.slug;
          calComLink = calEvent.bookingUrl || `https://cal.com/${process.env.NEXT_PUBLIC_CALCOM_USERNAME || "petitsalon"}/${calEvent.slug}`;
        }
      } catch (error) {
        console.error("Cal.com event update failed on create:", error);
      }
    } else {
      // Si no existe, creamos uno nuevo
      try {
        const calEvent = await createCalComEventType(
          parsed.data.name,
          parsed.data.duration,
          parsed.data.description || undefined,
          address
        );
        if (calEvent) {
          calComEventTypeId = calEvent.id;
          calComSlug = calEvent.slug;
          calComLink = calEvent.bookingUrl || `https://cal.com/${process.env.NEXT_PUBLIC_CALCOM_USERNAME || "petitsalon"}/${calEvent.slug}`;
        }
      } catch (error) {
        console.error("Cal.com event type creation failed:", error);
      }
    }

    // --- OVERBOOKING EVENT TYPE ---
    const overbookingScheduleId = env.CALCOM_OVERBOOKING_SCHEDULE_ID ? Number(env.CALCOM_OVERBOOKING_SCHEDULE_ID) : undefined;
    if (overbookingScheduleId) {
      if (calComOverbookingEventTypeId) {
        try {
          await updateCalComEventType(
            calComOverbookingEventTypeId,
            parsed.data.name, // Keep the same name as the user requested
            parsed.data.duration,
            parsed.data.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            calComSlug ? `${calComSlug}-sobrecupo` : undefined // explicit slug override
          );
        } catch (error) {
          console.error("Cal.com overbooking event update failed on create:", error);
        }
      } else {
        try {
          const calEvent = await createCalComEventType(
            parsed.data.name, // Same name
            parsed.data.duration,
            parsed.data.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            calComSlug ? `${calComSlug}-sobrecupo` : undefined
          );
          if (calEvent) {
            calComOverbookingEventTypeId = calEvent.id;
          }
        } catch (error) {
          console.error("Cal.com overbooking event type creation failed:", error);
        }
      }
    }

    await prisma.service.create({ 
      data: {
        ...parsed.data,
        calComEventTypeId,
        calComOverbookingEventTypeId,
        calComSlug,
        calComLink
      }
    });
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
    };

    const parsed = ServiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) throw new Error("Servicio no encontrado");

    let calComEventTypeId = existing.calComEventTypeId;
    let calComOverbookingEventTypeId = existing.calComOverbookingEventTypeId;
    let calComLink = existing.calComLink;
    let calComSlug = existing.calComSlug;

    const siteConfig = await prisma.siteConfig.findUnique({ where: { key: "address" } });
    const address = siteConfig?.value || "Carvajal 0330, La Cisterna";

    // Siempre intentar buscar si el event type ya existe en Cal.com por slug si no hay ID
    if (!calComEventTypeId || !calComOverbookingEventTypeId) {
      let slug = null;
      if (calComLink) {
        try {
          const urlObj = new URL(calComLink);
          const parts = urlObj.pathname.split("/").filter(Boolean);
          slug = parts[parts.length - 1];
        } catch {
          const parts = calComLink.split("/").filter(Boolean);
          slug = parts[parts.length - 1];
        }
      } else {
        slug = parsed.data.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (slug) {
        try {
          const eventTypes = await getCalComEventTypes();
          if (eventTypes) {
            const match = eventTypes.find(e => e.slug === slug);
            if (match && !calComEventTypeId) {
              calComEventTypeId = match.id;
              calComSlug = match.slug;
              calComLink = match.bookingUrl || calComLink;
            }
            const overbookingMatch = eventTypes.find(e => e.slug === `${slug}-sobrecupo`);
            if (overbookingMatch && !calComOverbookingEventTypeId) {
              calComOverbookingEventTypeId = overbookingMatch.id;
            }
          }
        } catch (e) {
          console.error("Failed to match event type by slug during update:", e);
        }
      }
    }

    if (calComEventTypeId) {
      try {
        const calEvent = await updateCalComEventType(
          calComEventTypeId,
          parsed.data.name,
          parsed.data.duration,
          parsed.data.description || undefined,
          address
        );
        if (calEvent) {
          calComSlug = calEvent.slug;
          calComLink = calEvent.bookingUrl || `https://cal.com/${process.env.NEXT_PUBLIC_CALCOM_USERNAME || "petitsalon"}/${calEvent.slug}`;
        }
      } catch (error) {
        console.error("Cal.com event update failed:", error);
      }
    } else {
      try {
        const calEvent = await createCalComEventType(
          parsed.data.name,
          parsed.data.duration,
          parsed.data.description || undefined,
          address
        );
        if (calEvent) {
          calComEventTypeId = calEvent.id;
          calComSlug = calEvent.slug;
          calComLink = calEvent.bookingUrl || `https://cal.com/${process.env.NEXT_PUBLIC_CALCOM_USERNAME || "petitsalon"}/${calEvent.slug}`;
        }
      } catch (error) {
        console.error("Cal.com event creation failed on update:", error);
      }
    }

    // --- OVERBOOKING EVENT TYPE ---
    const overbookingScheduleId = env.CALCOM_OVERBOOKING_SCHEDULE_ID ? Number(env.CALCOM_OVERBOOKING_SCHEDULE_ID) : undefined;
    if (overbookingScheduleId) {
      if (calComOverbookingEventTypeId) {
        try {
          await updateCalComEventType(
            calComOverbookingEventTypeId,
            parsed.data.name, // Keep the same name as the user requested
            parsed.data.duration,
            parsed.data.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            calComSlug ? `${calComSlug}-sobrecupo` : undefined // explicit slug override
          );
        } catch (error) {
          console.error("Cal.com overbooking event update failed on update:", error);
        }
      } else {
        try {
          const calEvent = await createCalComEventType(
            parsed.data.name, // Same name
            parsed.data.duration,
            parsed.data.description || undefined,
            address,
            overbookingScheduleId,
            true, // hidden
            calComSlug ? `${calComSlug}-sobrecupo` : undefined
          );
          if (calEvent) {
            calComOverbookingEventTypeId = calEvent.id;
          }
        } catch (error) {
          console.error("Cal.com overbooking event type creation failed on update:", error);
        }
      }
    }

    await prisma.service.update({ 
      where: { id }, 
      data: {
        ...parsed.data,
        calComEventTypeId,
        calComOverbookingEventTypeId,
        calComSlug,
        calComLink
      } 
    });
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (existing?.calComEventTypeId) {
      try {
        await deleteCalComEventType(existing.calComEventTypeId);
      } catch (err) {
        console.error("Cal.com primary event deletion failed:", err);
      }
    }
    if (existing?.calComOverbookingEventTypeId) {
      try {
        await deleteCalComEventType(existing.calComOverbookingEventTypeId);
      } catch (err) {
        console.error("Cal.com overbooking event deletion failed:", err);
      }
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
});

export type CategoryFormState = {
  errors?: {
    name?: string[];
    description?: string[];
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
    };

    const parsed = CategorySchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    // Assign the next available order
    const maxOrder = await prisma.serviceCategory.aggregate({
      _max: { order: true }
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    await prisma.serviceCategory.create({ 
      data: { ...parsed.data, order: nextOrder } 
    });
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

export async function reorderCategoriesAction(
  categoryIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    
    // Run all updates in a transaction
    await prisma.$transaction(
      categoryIds.map((id, index) => 
        prisma.serviceCategory.update({
          where: { id },
          data: { order: index }
        })
      )
    );
    
    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al reordenar las categorías" };
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

export async function reorderServicesAction(
  serviceIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.$transaction(
      serviceIds.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    revalidatePath("/admin/servicios");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Error al reordenar los servicios" };
  }
}
