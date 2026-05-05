import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AgendaCalendar from "@/components/admin/AgendaCalendar";

export const metadata = {
  title: "Agenda | Petit Salon Admin",
};

const STATUS_LEGEND = [
  { color: "#f59e0b", label: "Pendiente" },
  { color: "#3b82f6", label: "Confirmada" },
  { color: "#22c55e", label: "Realizada" },
  { color: "#9ca3af", label: "Cancelada" },
];

export default async function AgendaPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-light"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Agenda
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
            Gestiona las citas de Petit Salon.
          </p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-3">
          {STATUS_LEGEND.map(({ color, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--ps-text-mid)" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar (client component) */}
      <div
        className="rounded-3xl border p-4 shadow-sm overflow-hidden"
        style={{ borderColor: "var(--ps-lila-pale)", backgroundColor: "white" }}
      >
        <AgendaCalendar />
      </div>
    </div>
  );
}
