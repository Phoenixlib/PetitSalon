"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { destroyByUrls } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
const CreateSchema = z.object({
  photoUrl: z.string().url("URL de imagen inválida"),
  caption: z.string().max(200, "La descripción no puede superar los 200 caracteres").optional(),
});

export type CreatePhotoState = {
  errors?: { photoUrl?: string[]; caption?: string[]; _form?: string[] };
  success?: boolean;
};

export async function createGalleryPhotoAction(
  _prev: CreatePhotoState,
  formData: FormData,
): Promise<CreatePhotoState> {
  try {
    await requireAdmin();
  } catch {
    return { errors: { _form: ["No autorizado"] } };
  }

  const parsed = CreateSchema.safeParse({
    photoUrl: formData.get("photoUrl"),
    caption: formData.get("caption") || undefined,
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { errors: { photoUrl: fieldErrors.photoUrl, caption: fieldErrors.caption } };
  }

  const max = await prisma.galleryPhoto.aggregate({ _max: { order: true } });
  const nextOrder = (max._max.order ?? 0) + 1;

  await prisma.galleryPhoto.create({
    data: { ...parsed.data, order: nextOrder },
  });

  revalidatePath("/");
  revalidatePath("/admin/galeria");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete (+ Cloudinary cleanup)
// ---------------------------------------------------------------------------
export async function deleteGalleryPhotoAction(id: string): Promise<void> {
  await requireAdmin();

  // 1. Obtener la URL antes de borrar el registro
  const photo = await prisma.galleryPhoto.findUnique({
    where: { id },
    select: { photoUrl: true },
  });

  // 2. Borrar de la BD
  await prisma.galleryPhoto.delete({ where: { id } });

  // 3. Borrar imagen de Cloudinary
  if (photo) {
    await destroyByUrls([photo.photoUrl]);
  }

  revalidatePath("/");
  revalidatePath("/admin/galeria");
}

// ---------------------------------------------------------------------------
// Toggle Visibility
// ---------------------------------------------------------------------------
export async function togglePhotoVisibilityAction(
  id: string,
  isVisible: boolean,
): Promise<void> {
  await requireAdmin();
  await prisma.galleryPhoto.update({ where: { id }, data: { isVisible } });
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}

// ---------------------------------------------------------------------------
// Update Order
// ---------------------------------------------------------------------------
export async function updatePhotoOrderAction(
  items: Array<{ id: string; order: number }>,
): Promise<void> {
  await requireAdmin();
  await prisma.$transaction(
    items.map(({ id, order }) =>
      prisma.galleryPhoto.update({ where: { id }, data: { order } }),
    ),
  );
  revalidatePath("/");
  revalidatePath("/admin/galeria");
}
