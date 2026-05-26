"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function resetPasswordAction(
  _prevState: { success: boolean; error: string | null } | null,
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { success: false, error: "Token de recuperación no válido o ausente." };
  }

  if (!password || password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Las contraseñas no coinciden." };
  }

  try {
    const user = await prisma.adminUser.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "El enlace de recuperación es inválido o ha expirado.",
      };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("[RESET PASSWORD ERROR] Falló al restablecer contraseña:", error);
    return { success: false, error: "Ocurrió un error al restablecer la contraseña." };
  }
}
