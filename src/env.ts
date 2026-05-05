import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // NextAuth
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

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
