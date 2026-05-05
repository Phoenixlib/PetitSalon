import type { WorkingHours } from "./types";

/**
 * Horario de trabajo por defecto.
 * Personalizable al instanciar <BookingWizard workingHours={...} />
 */
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  days: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
  startHour: 9, // 09:00
  endHour: 18, // 18:00 (último slot a las 17:xx)
  slotMinutes: 60,
};

export const DOG_SIZE_LABELS: Record<string, string> = {
  XS: "XS — Miniatura (< 3 kg)",
  S: "S  — Pequeño (3–9 kg)",
  M: "M  — Mediano (10–20 kg)",
  L: "L  — Grande (21–40 kg)",
  XL: "XL — Gigante (> 40 kg)",
};

export const STEPS_LABELS: Record<string, string> = {
  service: "Servicio",
  date: "Fecha",
  time: "Hora",
  pet: "Mascota",
  owner: "Tus datos",
  summary: "Resumen",
};

export const WIZARD_STEPS = [
  "service",
  "date",
  "time",
  "pet",
  "owner",
  "summary",
] as const;
