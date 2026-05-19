import twilio from "twilio";
import { env } from "@/env";

/**
 * Cliente de Twilio inicializado con las credenciales de entorno.
 * Si las credenciales no están configuradas, el cliente será null.
 */
const getTwilioClient = () => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
};

/**
 * Normaliza un número de teléfono a formato E.164.
 * Twilio requiere que los números comiencen con el prefijo de país (ej. +34600000000).
 * Esta función es una implementación básica que asume números españoles si falta el prefijo,
 * o simplemente asegura que empiece por +.
 */
export function normalizePhoneNumber(phone: string): string {
  // Eliminar espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Si no empieza con +, asumimos España (+34) por defecto si tiene 9 dígitos
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 9) {
      cleaned = "+34" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }

  return cleaned;
}

interface ReminderData {
  ownerName: string;
  petName: string;
  dateStr: string;
  timeStr: string;
}

/**
 * Envía un mensaje por WhatsApp usando Twilio.
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getTwilioClient();

  if (!client || !env.TWILIO_WHATSAPP_NUMBER) {
    console.warn(
      "[TWILIO] Twilio no está configurado. El mensaje para " +
        to +
        " no se envió.",
    );
    return { success: false, error: "Twilio not configured" };
  }

  const normalizedTo = normalizePhoneNumber(to);
  const from = env.TWILIO_WHATSAPP_NUMBER.startsWith("whatsapp:")
    ? env.TWILIO_WHATSAPP_NUMBER
    : `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`;

  try {
    const message = await client.messages.create({
      from,
      to: `whatsapp:${normalizedTo}`,
      body,
    });

    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.error("[TWILIO ERROR] Fallo al enviar WhatsApp:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía un recordatorio de cita (para mañana) por WhatsApp.
 */
export async function sendWhatsAppReminder(
  to: string,
  data: ReminderData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `¡Hola ${data.ownerName}! 🐾 Te recordamos la cita de ${data.petName} en Petit Salon para mañana ${data.dateStr} a las ${data.timeStr}. ¡Te esperamos!`;
  return sendWhatsAppMessage(to, body);
}

/**
 * Envía una notificación de confirmación de nueva cita.
 */
export async function sendWhatsAppConfirmation(
  to: string,
  data: ReminderData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `¡Hola ${data.ownerName}! 🐾 Tu cita para ${data.petName} en Petit Salon ha sido confirmada para el ${data.dateStr} a las ${data.timeStr}. ¡Gracias por confiar en nosotros!`;
  return sendWhatsAppMessage(to, body);
}

/**
 * Envía una notificación para el mismo día de la cita.
 */
export async function sendWhatsAppTodayReminder(
  to: string,
  data: ReminderData,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const body = `¡Hola ${data.ownerName}! 🐾 Te recordamos que hoy es la cita de ${data.petName} en Petit Salon a las ${data.timeStr}. ¡Nos vemos pronto!`;
  return sendWhatsAppMessage(to, body);
}
