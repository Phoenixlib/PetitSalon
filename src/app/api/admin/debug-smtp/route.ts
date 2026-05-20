import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { env } from "@/env";

// Forzar que esta ruta sea dinámica y no se guarde en caché en Vercel
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  
  // Proteger la ruta para que solo un admin logged in pueda ver esto
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    message: "SMTP Environment Variables Debug",
    // 1. Lo que Node/Vercel recibe exactamente (ocultando valores sensibles):
    raw_process_env: {
      SMTP_HOST_EXISTS: !!process.env.SMTP_HOST,
      SMTP_HOST_VALUE: process.env.SMTP_HOST || "UNDEFINED",
      SMTP_PORT_VALUE: process.env.SMTP_PORT || "UNDEFINED",
      SMTP_USER_EXISTS: !!process.env.SMTP_USER,
      SMTP_USER_VALUE: process.env.SMTP_USER || "UNDEFINED",
      SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
      SMTP_PASS_LENGTH: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
      SMTP_PASS_HAS_SPACES: process.env.SMTP_PASS ? process.env.SMTP_PASS.includes(" ") : false,
    },
    // 2. Lo que nuestra app entiende luego de pasar por zod (src/env.ts):
    parsed_zod_env: {
      SMTP_HOST_EXISTS: !!env.SMTP_HOST,
      SMTP_PORT_VALUE: env.SMTP_PORT || "UNDEFINED",
      SMTP_USER_EXISTS: !!env.SMTP_USER,
      SMTP_PASS_EXISTS: !!env.SMTP_PASS,
    },
    // 3. Prueba de cómo reacciona tu archivo lib/email.ts
    isSmtpConfigured_Result: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
    NODE_ENV: process.env.NODE_ENV,
  });
}
