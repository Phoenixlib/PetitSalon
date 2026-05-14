"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
const CreateSchema = z.object({
  beforeUrl: z.string().url("URL inválida para foto 'antes'"),
  afterUrl: z.string().url("URL inválida para foto 'después'"),
  breed: z.string().max(100).optional(),
});

export type CreateState = {
  errors?: { beforeUrl?: string[]; afterUrl?: string[]; _form?: string[] };
  success?: boolean;
};

export async function createGalleryPairAction(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  try {
    await requireAdmin();
  } catch {
    return { errors: { _form: ["No autorizado"] } };
  }

  const parsed = CreateSchema.safeParse({
    beforeUrl: formData.get("beforeUrl"),
    afterUrl: formData.get("afterUrl"),
    breed: formData.get("breed") || undefined,
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { errors: { beforeUrl: fieldErrors.beforeUrl, afterUrl: fieldErrors.afterUrl } };
  }

  const max = await prisma.galleryPair.aggregate({ _max: { order: true } });
  const nextOrder = (max._max.order ?? 0) + 1;

  await prisma.galleryPair.create({
    data: { ...parsed.data, order: nextOrder },
  });

  revalidatePath("/");
  revalidatePath("/admin/galeria");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export async function deleteGalleryPairAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.galleryPair.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}

// ---------------------------------------------------------------------------
// Toggle Visibility
// ---------------------------------------------------------------------------
export async function toggleVisibilityAction(
  id: string,
  isVisible: boolean,
): Promise<void> {
  await requireAdmin();
  await prisma.galleryPair.update({ where: { id }, data: { isVisible } });
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}

// ---------------------------------------------------------------------------
// Update Order
// ---------------------------------------------------------------------------
export async function updateOrderAction(
  items: Array<{ id: string; order: number }>,
): Promise<void> {
  await requireAdmin();
  await prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.galleryPair.update({ where: { id }, data: { order } }),
    ),
  );
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}
