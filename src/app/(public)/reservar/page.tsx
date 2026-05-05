import { prisma } from "@/lib/prisma";
import BookingWizard from "@/components/booking/BookingWizard";
import type { BookingService } from "@/components/booking/types";

export const metadata = {
  title: "Reservar cita | Petit Salon",
  description: "Agenda la sesión de peluquería de tu mascota en Petit Salon.",
};

async function getServices(): Promise<BookingService[]> {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function ReservarPage() {
  const services = await getServices();

  return (
    <main
      className="min-h-screen py-16 px-4"
      style={{ backgroundColor: "var(--ps-bg)" }}
    >
      {services.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20">
          <p
            className="text-lg font-light"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Los servicios no están disponibles en este momento.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ps-text-mid)" }}>
            Escríbenos por WhatsApp y coordinamos directamente.
          </p>
          <a
            href="https://wa.me/56937541863"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "#25d366" }}
          >
            Escribir por WhatsApp
          </a>
        </div>
      ) : (
        <BookingWizard services={services} />
      )}
    </main>
  );
}
