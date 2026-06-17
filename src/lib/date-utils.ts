/**
 * Utilidades para el manejo consistente de fechas y horas en el huso horario de Chile (America/Santiago).
 */

/**
 * Convierte un string de fecha local (ej: "2026-06-17T15:30:00", "2026-06-17T15:30", o "2026-06-17 15:30")
 * interpretándolo en la zona horaria de Chile (America/Santiago) y retornando un objeto Date correcto.
 * Si el string ya contiene información de zona horaria (ej: "Z", "+00:00", "-04:00"), se parsea directamente.
 */
export function parseSantiagoDate(dateStr: string): Date {
  const normalized = dateStr.trim().replace(" ", "T");
  
  // Si ya tiene offset o sufijo de zona horaria, se parsea de forma estándar
  if (/[Z+-]\d{2}(:\d{2})?$/.test(normalized) || normalized.endsWith("Z")) {
    return new Date(normalized);
  }
  
  // Si no tiene zona horaria, asumimos local de Chile (America/Santiago)
  const parts = normalized.split(/[-T:]/);
  const year = parseInt(parts[0] || "0", 10);
  const month = parseInt(parts[1] || "1", 10) - 1;
  const day = parseInt(parts[2] || "1", 10);
  const hours = parseInt(parts[3] || "0", 10);
  const minutes = parseInt(parts[4] || "0", 10);
  const seconds = parseInt(parts[5] || "0", 10);
  
  // Crear una fecha UTC tentativa con los mismos componentes locales
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  
  // Formatear esa fecha UTC a la hora que tendría en Santiago
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  
  const partsSantiago = formatter.formatToParts(utcDate);
  const getVal = (type: string) => parseInt(partsSantiago.find(p => p.type === type)?.value || "0", 10);
  
  const sYear = getVal("year");
  const sMonth = getVal("month") - 1;
  const sDay = getVal("day");
  let sHours = getVal("hour");
  if (sHours === 24) sHours = 0;
  const sMinutes = getVal("minute");
  const sSeconds = getVal("second");
  
  const sUtc = Date.UTC(sYear, sMonth, sDay, sHours, sMinutes, sSeconds);
  const diffMs = utcDate.getTime() - sUtc;
  
  // Ajustar la fecha original UTC para que coincida con la hora local de Santiago
  return new Date(utcDate.getTime() + diffMs);
}

/**
 * Parsea cualquier tipo de entrada (Date, número de ms, o string) de forma segura.
 * Si es string sin zona horaria, se asume America/Santiago.
 */
export function parseIncomingDate(val: any): Date {
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date(val);
  if (typeof val !== "string") return new Date(val);
  return parseSantiagoDate(val);
}

/**
 * Formatea una fecha a un string local de Santiago de Chile.
 */
export function formatInSantiago(
  date: Date,
  formatStr: "yyyy-MM-dd" | "HH:mm" | "yyyy-MM-dd HH:mm" | "ISO" = "yyyy-MM-dd HH:mm"
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const getVal = (type: string) => parts.find(p => p.type === type)?.value || "";
  
  const year = getVal("year");
  const month = getVal("month");
  const day = getVal("day");
  let hour = getVal("hour");
  if (hour === "24") hour = "00";
  const minute = getVal("minute");
  const second = getVal("second");
  
  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`;
  }
  if (formatStr === "HH:mm") {
    return `${hour}:${minute}`;
  }
  if (formatStr === "ISO") {
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * Formatea usando el locale chileno (es-CL) asegurando zona horaria America/Santiago.
 */
export function formatSantiagoLocale(
  date: Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return date.toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    ...options,
  });
}

/**
 * Obtiene el rango de inicio y fin de un día específico en la zona horaria de Chile.
 * Retorna objetos Date en UTC correspondientes a las fronteras locales de Santiago.
 */
export function getSantiagoDayBounds(offsetDays: number = 0): { start: Date; end: Date } {
  const now = new Date();
  const dateStr = formatInSantiago(now, "yyyy-MM-dd");
  
  // Usar el mediodía local para evitar problemas con la transición de horario de verano/invierno al sumar días
  const date = parseSantiagoDate(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + offsetDays);
  
  const targetDateStr = formatInSantiago(date, "yyyy-MM-dd");
  
  return {
    start: parseSantiagoDate(`${targetDateStr}T00:00:00`),
    end: parseSantiagoDate(`${targetDateStr}T23:59:59.999`),
  };
}
