"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Correo o contraseña incorrectos.";
    }
    // Re-throw NEXT_REDIRECT — Next.js lo captura internamente para redirigir
    throw error;
  }
  return null;
}
