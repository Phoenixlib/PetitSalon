import CalComEmbed from "@/components/booking/CalComEmbed";

// El link de Cal.com tiene el formato "usuario/tipo-de-evento"
// Configura NEXT_PUBLIC_CALCOM_LINK en .env.local, ej: petitsalon/cita
const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK ?? "";

export default function ReservarPage() {
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
          <CalComEmbed calLink={calLink} />
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
