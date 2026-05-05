// ─────────────────────────────────────────────────────────────────────────────
// Booking Wizard — Tipos compartidos
// Diseñado para ser reutilizable en cualquier proyecto Next.js + Prisma
// ─────────────────────────────────────────────────────────────────────────────

export type DogSize = "XS" | "S" | "M" | "L" | "XL";

export interface BookingService {
  id: string;
  name: string;
  price: number; // CLP
  duration: number; // minutos
  description?: string | null;
}

export interface BookingFormData {
  // Paso 1 — Servicio
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;

  // Paso 2 — Fecha
  date: string; // ISO "YYYY-MM-DD"

  // Paso 3 — Hora
  time: string; // "HH:mm"

  // Paso 4 — Mascota
  dogName: string;
  dogBreed: string;
  dogSize: DogSize;
  dogNotes: string;

  // Paso 5 — Dueño
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

export interface WorkingHours {
  /** Días hábiles: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb */
  days: number[];
  startHour: number; // 0–23
  endHour: number; // 0–23 (exclusivo)
  slotMinutes: number;
}

export type WizardStep =
  | "service"
  | "date"
  | "time"
  | "pet"
  | "owner"
  | "summary";
