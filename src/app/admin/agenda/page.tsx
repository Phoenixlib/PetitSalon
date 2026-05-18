import { prisma } from "@/lib/prisma";
import AgendaCalendar from "@/components/admin/AgendaCalendar";
import type { AppointmentWithRelations } from "@/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda — Petit Salón Admin" };

export default async function AgendaPage() {
  // Carga el mes actual (±30 días desde hoy) para la carga inicial
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);  // primer día del mes
  const to   = new Date(now.getFullYear(), now.getMonth() + 2, 0); // último día del mes siguiente

  const appointments: AppointmentWithRelations[] = await prisma.appointment.findMany({
    where: {
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      calComUid: true,
      date: true,
      status: true,
      notes: true,
      createdAt: true,
      dog: {
        select: {
          id: true,
          name: true,
          breed: true,
          owner: { select: { id: true, name: true, phone: true, email: true } },
        },
      },
      service: { select: { id: true, name: true, price: true, duration: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--ps-text)" }}>
          Agenda
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
          Vista de citas por semana, mes o día.
        </p>
      </div>

      {/* Leyenda de estados */}
      <div className="flex flex-wrap gap-3 text-xs font-medium">
        {[
          { label: "Pendiente",  bg: "#fbbf24", text: "#78350f" },
          { label: "Confirmada", bg: "#3b82f6", text: "#ffffff" },
          { label: "Realizada",  bg: "#22c55e", text: "#ffffff" },
          { label: "Cancelada",  bg: "#d1d5db", text: "#6b7280" },
        ].map(({ label, bg, text }) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1" style={{ backgroundColor: bg, color: text }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: text, opacity: 0.6 }} />
            {label}
          </span>
        ))}
      </div>

      <AgendaCalendar initialAppointments={appointments} />
    </div>
  );
}
