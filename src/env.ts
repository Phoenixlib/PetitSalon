import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // NextAuth
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),

  // Cloudinary (requerido solo para subida de fotos)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Email (Nodemailer — opcional; si no está configurado, los emails se omiten)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  NOTIFY_EMAIL: z.string().email().optional(),

  // Cal.com
  // HMAC secret configurado en Cal.com → Settings → Webhooks para validar el origen
  CALCOM_WEBHOOK_SECRET: z.string().optional(),
  // Link de Cal.com: "usuario/tipo-de-evento" — expuesto al cliente (build-time)
  NEXT_PUBLIC_CALCOM_LINK: z.string().optional(),
  CALCOM_API_KEY: z.string().min(1),

  // URL base de la app (para construir links en emails)
  APP_URL: z.string().url().optional(),

  // Cron Job Secret (Vercel)
  CRON_SECRET: z.string().optional(),

  // Twilio (WhatsApp Reminders)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // App
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Variables de entorno inválidas:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Variables de entorno inválidas. Revisa .env.local");
}

export const env = parsed.data;
