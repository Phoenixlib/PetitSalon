"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/env";
import { headers } from "next/headers";
import crypto from "crypto";

export async function requestResetAction(
  _prevState: { success: boolean; error: string | null } | null,
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Correo electrónico no válido." };
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Por seguridad, si el usuario no existe no lo revelamos al atacante,
    // simplemente devolvemos éxito para evitar enumeración de usuarios.
    if (!user) {
      return { success: true, error: null };
    }

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000); // 1 hora de validez

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const hostHeader = (await headers()).get("host");
    const protocol = hostHeader?.includes("localhost") ? "http" : "https";
    const baseUrl = env.APP_URL || env.NEXTAUTH_URL || `${protocol}://${hostHeader}`;
    const resetUrl = `${baseUrl}/admin/login/resetear?token=${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return { success: true, error: null };
  } catch (error) {
    console.error("[RESET PASSWORD ERROR] Falló al solicitar recuperación:", error);
    return { success: false, error: "Ocurrió un error al procesar tu solicitud." };
  }
}
