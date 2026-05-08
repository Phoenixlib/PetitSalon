import Link from "next/link";
import { CalendarDays, Users, PawPrint, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { AppointmentWithRelations } from "@/types";

// ---------------------------------------------------------------------------
// Helpers de fecha  (UTC — la dueña verá las citas en su zona local al
// abrir el calendario. Para el dashboard usamos UTC como aproximación.)
// ---------------------------------------------------------------------------
function startOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500",
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const todayEnd = addDaysUTC(todayStart, 1);
  const next7daysEnd = addDaysUTC(todayStart, 7);

  const [todayCount, upcomingAppointments, ownerCount, dogCount] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lt: todayEnd },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: now, lt: next7daysEnd },
          status: { not: "CANCELLED" },
        },
        orderBy: { date: "asc" },
        take: 10,
        select: {
          id: true,
          date: true,
          status: true,
          notes: true,
          createdAt: true,
          dog: {
            select: {
              id: true,
              name: true,
              breed: true,
              owner: {
                select: { id: true, name: true, phone: true },
              },
            },
          },
          service: {
            select: { id: true, name: true, price: true, duration: true },
          },
        },
      }),
      prisma.owner.count(),
      prisma.dog.count(),
    ]);

  return {
    todayCount,
    upcomingAppointments: upcomingAppointments as AppointmentWithRelations[],
    ownerCount,
    dogCount,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AdminDashboardPage() {
  const { todayCount, upcomingAppointments, ownerCount, dogCount } =
    await getDashboardData();

  const stats = [
    {
      label: "Citas hoy",
      value: todayCount,
      icon: CalendarDays,
      href: "/admin/citas",
    },
    {
      label: "Próximos 7 días",
      value: upcomingAppointments.length,
      icon: Clock,
      href: "/admin/agenda",
    },
    {
      label: "Clientes",
      value: ownerCount,
      icon: Users,
      href: "/admin/clientes",
    },
    {
      label: "Perritos",
      value: dogCount,
      icon: PawPrint,
      href: "/admin/perros",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--ps-text)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
          Resumen del día
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-md"
            style={{
              backgroundColor: "white",
              border: "1px solid var(--ps-lila-light)",
            }}
          >
            <div
              className="size-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--ps-lila-pale)" }}
            >
              <Icon className="size-4" style={{ color: "var(--ps-lila)" }} />
            </div>
            <div>
              <p
                className="text-2xl font-semibold leading-tight"
                style={{ color: "var(--ps-text)" }}
              >
                {value}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--ps-text-mid)" }}
              >
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Próximas citas */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--ps-lila-light)" }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{
            backgroundColor: "var(--ps-lila-pale)",
            borderColor: "var(--ps-lila-light)",
          }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--ps-text)" }}
          >
            Próximas citas (7 días)
          </h2>
          <Link
            href="/admin/agenda"
            className="text-xs font-medium"
            style={{ color: "var(--ps-lila)" }}
          >
            Ver agenda →
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="px-4 py-10 text-center bg-white">
            <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
              No hay citas programadas para los próximos 7 días.
            </p>
          </div>
        ) : (
          <div className="bg-white divide-y divide-surface">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{
                      backgroundColor: "var(--ps-lila-pale)",
                      color: "var(--ps-lila-deep)",
                    }}
                  >
                    {appt.dog.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {appt.dog.name}{" "}
                      <span
                        className="font-normal"
                        style={{ color: "var(--ps-text-mid)" }}
                      >
                        · {appt.service.name}
                      </span>
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--ps-text-mid)" }}
                    >
                      {appt.dog.owner.name} · {appt.dog.breed}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--ps-text)" }}
                  >
                    {formatDate(appt.date)} {formatTime(appt.date)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
