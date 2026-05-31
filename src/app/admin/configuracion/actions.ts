"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(
  _prevState: { success: boolean; error: string | null; successMessage: string | null } | null,
  formData: FormData,
): Promise<{ success: boolean; error: string | null; successMessage: string | null }> {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "No autorizado. Debes iniciar sesión.", successMessage: null };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Todos los campos son obligatorios.", successMessage: null };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "La nueva contraseña debe tener al menos 8 caracteres.", successMessage: null };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "La nueva contraseña y su confirmación no coinciden.", successMessage: null };
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado.", successMessage: null };
    }

    const isCurrentPasswordCorrect = await compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return { success: false, error: "La contraseña actual es incorrecta.", successMessage: null };
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true, error: null, successMessage: "Contraseña actualizada exitosamente." };
  } catch (error) {
    console.error("[CHANGE PASSWORD ERROR]:", error);
    return { success: false, error: "Ocurrió un error al intentar cambiar la contraseña.", successMessage: null };
  }
}

export async function toggleAgendaBloqueadaAction(
  bloqueada: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "No autorizado." };
  }
  try {
    await prisma.siteConfig.upsert({
      where: { key: "agenda_bloqueada" },
      update: { value: bloqueada ? "true" : "false" },
      create: { key: "agenda_bloqueada", value: bloqueada ? "true" : "false" },
    });
    revalidatePath("/"); // para que el landing público se actualice
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error) {
    console.error("[TOGGLE AGENDA ERROR]:", error);
    return { success: false, error: "Error al guardar la configuración." };
  }
}

