export type WhatsappTemplate = "REMINDER" | "READY_FOR_PICKUP" | "CONFIRMATION";

/**
 * Formats a phone number for WhatsApp wa.me API.
 * Removes all non-numeric characters.
 * If the number is 9 digits (typical in Chile), prepends the country code.
 */
export function formatPhoneForWA(
  phone: string,
  countryCode: string = "56",
): string {
  // Elimina cualquier carácter que no sea dígito
  const cleaned = phone.replace(/\D/g, "");

  // Si el número tiene 9 dígitos exactos (e.g. 912345678), asume código de país omitido
  if (cleaned.length === 9) {
    return `${countryCode}${cleaned}`;
  }

  // Si comienza con 0, a veces la gente lo pone por costumbre en algunos países, puedes quitarlo
  // if (cleaned.startsWith('0') && cleaned.length === 10) return `${countryCode}${cleaned.substring(1)}`;

  // De lo contrario se devuelve tal cual asumiendo que ya tiene el cod o es válido
  return cleaned;
}

interface WhatsappMessageOptions {
  ownerName: string;
  dogName: string;
  serviceName?: string;
  dateStr?: string;
  timeStr?: string;
}

export function getWhatsappLink(
  phone: string,
  template: WhatsappTemplate,
  options: WhatsappMessageOptions,
): string {
  const formattedPhone = formatPhoneForWA(phone);
  let message = "";

  const { ownerName, dogName, serviceName, dateStr, timeStr } = options;

  switch (template) {
    case "REMINDER":
      message = `¡Hola ${ownerName}! 👋 Te escribimos de *Petit Salón* para recordarte tu cita para *${dogName}* (${serviceName || "Servicio"}).\n\n📅 Fecha: ${dateStr}\n⏰ Hora: ${timeStr}hs.\n\n¡Los esperamos! 🐾`;
      break;
    case "READY_FOR_PICKUP":
      message = `¡Hola ${ownerName}! 👋 Te avisamos que *${dogName}* ya está listo/a y quedó hermoso/a ✨. Ya puedes pasar a buscarlo/a.\n\n¡Nos vemos! 🐾`;
      break;
    case "CONFIRMATION":
      message = `¡Hola ${ownerName}! 👋 Confirmamos tu reserva en *Petit Salón* para *${dogName}* (${serviceName}) el ${dateStr} a las ${timeStr}hs. ¡Gracias por confiar en nosotros! 🐾`;
      break;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
