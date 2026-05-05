import nodemailer from "nodemailer";
import { env } from "@/env";

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
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.NOTIFY_EMAIL) {
    return; // email no configurado — ok para desarrollo
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

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

  await transporter.sendMail({
    from: `"Petit Salon" <${env.SMTP_USER}>`,
    to: env.NOTIFY_EMAIL,
    subject: `Nueva cita: ${data.dogName} — ${data.date} ${data.time}`,
    html,
  });
}
