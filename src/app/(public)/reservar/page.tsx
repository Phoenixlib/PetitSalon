import BookingFlow from "@/components/booking/BookingFlow";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ link?: string; servicio?: string }>;
}

export default async function ReservarPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const linkParam = resolvedParams.link;
  const servicioParam = resolvedParams.servicio;

  // Usa el link específico por parámetro, o el genérico configurado por defecto
  const calLink = linkParam || process.env.NEXT_PUBLIC_CALCOM_LINK || "";

  // Obtener datos bancarios y de contacto para mostrar en la pantalla de éxito
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: [
          "bank_owner_name",
          "bank_rut",
          "bank_name",
          "bank_account_type",
          "bank_account_number",
          "bank_email",
          "whatsapp",
          "agenda_bloqueada"
        ]
      }
    }
  });
  const bankConfig = Object.fromEntries(configs.map((c) => [c.key, c.value]));

  const agendaBloqueada = bankConfig.agenda_bloqueada === "true";
  const whatsapp = bankConfig.whatsapp || "";
  const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, quisiera información para agendar una cita.")}`;

  if (agendaBloqueada) {
    return (
      <section className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-xl border border-[var(--ps-lila-light)]">
          <div className="text-5xl mb-4">🔒</div>
          <h1
            className="text-2xl font-semibold mb-3 animate-fade-in"
            style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
          >
            Agenda Cerrada
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--ps-text-mid)" }}>
            En este momento nuestra agenda online está cerrada temporalmente. Para más información o para agendar una cita, por favor comunícate con nosotros por WhatsApp.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 w-full"
            style={{ backgroundColor: "#25D366" }}
          >
            📲 Escribir por WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {calLink ? (
          <BookingFlow calLink={calLink} servicio={servicioParam} bankConfig={bankConfig} />
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <p className="font-medium">Sistema de reservas en configuración.</p>
            <p className="text-sm mt-1">
              Mientras tanto, contáctanos por WhatsApp para agendar tu cita.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

