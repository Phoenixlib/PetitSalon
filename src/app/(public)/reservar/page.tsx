import BookingFlow from "@/components/booking/BookingFlow";

interface Props {
  searchParams: Promise<{ link?: string; servicio?: string }>;
}

export default async function ReservarPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const linkParam = resolvedParams.link;
  const servicioParam = resolvedParams.servicio;

  // Usa el link específico por parámetro, o el genérico configurado por defecto
  const calLink = linkParam || process.env.NEXT_PUBLIC_CALCOM_LINK || "";

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Reserva tu Cita
          </h1>
          <p className="text-muted-foreground">
            Elige el servicio, día y hora que más te acomode. Recibirás una
            confirmación por correo.
          </p>
        </div>

        {calLink ? (
          <BookingFlow calLink={calLink} servicio={servicioParam} />
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
