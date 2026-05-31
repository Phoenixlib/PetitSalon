import { prisma } from "@/lib/prisma";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import AgendaToggle from "@/components/admin/AgendaToggle";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
  const configRow = await prisma.siteConfig.findUnique({
    where: { key: "agenda_bloqueada" },
  });
  const agendaBloqueada = configRow?.value === "true";

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--ps-text)" }}
        >
          Configuración
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
          Administra las opciones de tu cuenta y seguridad
        </p>
      </div>

      {/* Control de agenda pública */}
      <AgendaToggle initialValue={agendaBloqueada} />

      <div
        className="rounded-xl overflow-hidden max-w-2xl"
        style={{ border: "1px solid var(--ps-lila-light)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{
            backgroundColor: "var(--ps-lila-pale)",
            borderColor: "var(--ps-lila-light)",
          }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--ps-text)" }}
          >
            Cambiar contraseña
          </h2>
        </div>
        <div className="p-4 md:p-6 bg-white">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
