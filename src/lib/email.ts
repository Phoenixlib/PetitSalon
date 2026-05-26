import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@/env";

/**
 * Crea un transporter Nodemailer compartido.
 *
 * IMPORTANTE — Puerto 587 (STARTTLS) en lugar de 465 (SSL implícito):
 * Vercel (y AWS en general) bloquea el puerto 465 en el plan Hobby.
 * El puerto 587 con STARTTLS funciona correctamente en producción y local.
 * Ref: https://vercel.com/guides/sending-emails-with-nodemailer
 */
function createTransporter(): Transporter {
  const port = env.SMTP_PORT ?? 587;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    // secure:true solo para puerto 465 (SSL implícito).
    // Para 587 (STARTTLS) debe ser false — Nodemailer negocia TLS automáticamente.
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      // Las App Passwords de Google se muestran con espacios en la UI de Google,
      // pero deben guardarse SIN espacios en las variables de entorno.
      pass: env.SMTP_PASS,
    },
  });
}

/** Verifica si SMTP está configurado en el entorno actual */
function isSmtpConfigured(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

interface AppointmentEmailData {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  dogName: string;
  dogBreed: string;
  dogSize: string;
  serviceName: string;
  date: string; // "DD/MM/YYYY"
  time: string; // "HH:mm"
  notes?: string;
}

/**
 * Envía email de notificación al administrador cuando llega una nueva cita.
 * Si las variables SMTP no están configuradas, la función es un no-op silencioso.
 */
export async function sendNewAppointmentEmail(
  data: AppointmentEmailData,
): Promise<void> {
  if (!isSmtpConfigured() || !env.NOTIFY_EMAIL) {
    return; // email no configurado — ok para desarrollo
  }

  const transporter = createTransporter();

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#7c3aed">🐾 Nueva solicitud de cita — Petit Salon</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Fecha</th><td style="padding:6px">${data.date} a las ${data.time}</td></tr>
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Servicio</th><td style="padding:6px">${data.serviceName}</td></tr>
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Perro</th><td style="padding:6px">${data.dogName} — ${data.dogBreed} (Talla ${data.dogSize})</td></tr>
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Dueño</th><td style="padding:6px">${data.ownerName}</td></tr>
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Teléfono</th><td style="padding:6px">${data.ownerPhone}</td></tr>
        <tr><th style="text-align:left;padding:6px;background:#f3f0ff">Email</th><td style="padding:6px">${data.ownerEmail || "—"}</td></tr>
        ${data.notes ? `<tr><th style="text-align:left;padding:6px;background:#f3f0ff">Notas</th><td style="padding:6px">${data.notes}</td></tr>` : ""}
      </table>
      <p style="margin-top:20px;font-size:12px;color:#666">
        Accede al <a href="${env.NEXTAUTH_URL ?? ""}/admin/agenda">panel de agenda</a> para confirmar o rechazar la cita.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Petit Salon" <${env.SMTP_USER}>`,
      to: env.NOTIFY_EMAIL,
      subject: `Nueva cita: ${data.dogName} — ${data.date} ${data.time}`,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] sendNewAppointmentEmail falló:", error);
    // No re-lanzar — el fallo de email no debe bloquear el registro de la cita
  }
}

interface ReviewRequestEmailData {
  ownerName: string;
  petName: string;
  reviewUrl: string; // ej: https://dominio.com/resena/[token]
}

/**
 * Envía email al cliente con el link para dejar una reseña.
 * Es un no-op silencioso si SMTP no está configurado.
 */
export async function sendReviewRequestEmail(
  to: string,
  data: ReviewRequestEmailData,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("-----------------------------------------------------");
    console.log(`[EMAIL SIMULADO] Se generó una solicitud de reseña para ${data.ownerName}`);
    console.log(`URL de Reseña: ${data.reviewUrl}`);
    console.log("-----------------------------------------------------");
    return;
  }

  const transporter = createTransporter();

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
      <h2 style="color:#c17b5c;margin-bottom:8px">🐾 ¡Gracias por visitar Petit Salon!</h2>
      <p style="color:#444;font-size:15px">
        Hola <strong>${data.ownerName}</strong>, esperamos que <strong>${data.petName}</strong> haya quedado precioso/a 🐶
      </p>
      <p style="color:#444;font-size:15px">
        Nos encantaría conocer tu experiencia. ¿Nos dejas una reseña? Solo toma un minuto.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a
          href="${data.reviewUrl}"
          style="background:#c17b5c;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px"
        >
          Dejar mi reseña ⭐
        </a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center">
        Este link es de un solo uso y es exclusivo para ti.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Petit Salon" <${env.SMTP_USER}>`,
      to,
      subject: `¿Cómo fue la experiencia de ${data.petName} en Petit Salon? 🐾`,
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] sendReviewRequestEmail falló:", error);
    // No re-lanzar — el fallo de email no debe bloquear la creación de la reseña
  }
}

interface CampaignEmailData {
  ownerName: string;
  subject: string;
  htmlBody: string;
}

/**
 * Envía un email de campaña personalizado al cliente.
 * Es un no-op silencioso (con log) si SMTP no está configurado.
 */
export async function sendCampaignEmail(
  to: string,
  data: CampaignEmailData,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(`[EMAIL SIMULADO — CAMPAÑA] Para: ${to} | Asunto: ${data.subject}`);
    return;
  }

  const transporter = createTransporter();

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#c17b5c;font-size:22px;margin:0">🐾 Petit Salon</h1>
      </div>
      <div style="background:#fffaf7;border:1px solid #f3e8df;border-radius:16px;padding:28px">
        <p style="margin:0 0 16px;color:#6b5c55;font-size:14px">Hola <strong>${data.ownerName}</strong>,</p>
        ${data.htmlBody}
      </div>
      <p style="color:#aaa;font-size:11px;text-align:center;margin-top:20px">
        Petit Salon · Peluquería Canina Premium
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Petit Salon" <${env.SMTP_USER}>`,
      to,
      subject: data.subject,
      html,
    });
  } catch (error) {
    console.error(`[EMAIL ERROR] sendCampaignEmail falló para ${to}:`, error);
    // Re-lanzar en campañas para que el caller pueda contar los fallos
    throw error;
  }
}

/**
 * Envía un email al administrador con el enlace de recuperación de contraseña.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log("-----------------------------------------------------");
    console.log(`[EMAIL SIMULADO] Recuperación de contraseña para: ${to}`);
    console.log(`URL de recuperación: ${resetUrl}`);
    console.log("-----------------------------------------------------");
    return;
  }

  const transporter = createTransporter();

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
      <h2 style="color:#7c3aed;margin-bottom:8px">🐾 Recuperación de Contraseña — Petit Salon</h2>
      <p style="color:#444;font-size:15px">
        Hola, se ha solicitado un restablecimiento de contraseña para tu cuenta de administrador en Petit Salon.
      </p>
      <p style="color:#444;font-size:15px">
        Para restablecer tu contraseña, haz clic en el siguiente botón. Este enlace es válido por 1 hora.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a
          href="${resetUrl}"
          style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px"
        >
          Restablecer Contraseña 🔒
        </a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center">
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Petit Salon" <${env.SMTP_USER}>`,
      to,
      subject: "Recuperación de Contraseña 🔒 — Petit Salon",
      html,
    });
  } catch (error) {
    console.error("[EMAIL ERROR] sendPasswordResetEmail falló:", error);
    throw error;
  }
}

