import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/public/Hero";
import AcercaDeNosotros from "@/components/public/AcercaDeNosotros";
import Servicios from "@/components/public/Servicios";
import Galeria from "@/components/public/Galeria";
import Testimonios from "@/components/public/Testimonios";
import FAQ from "@/components/public/FAQ";
import ContactoCTA from "@/components/public/ContactoCTA";
import Ubicacion from "@/components/public/Ubicacion";

export const metadata: Metadata = {
  title: "Petit Salón | Peluquería Canina Premium",
  description:
    "Peluquería canina premium. Baño y secado, corte, corte de uñas con amor y profesionalismo. ¡Reserva tu turno hoy!",
};

export default async function HomePage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          description: true,
          calComLink: true,
        },
      },
    },
  });

  const uncategorizedServices = await prisma.service.findMany({
    where: { isActive: true, categoryId: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      description: true,
      calComLink: true,
    },
  });

  return (
    <>
      <Hero />
      <AcercaDeNosotros />
      <Servicios
        categories={categories}
        uncategorizedServices={uncategorizedServices}
      />
      <Galeria />
      <Testimonios />
      <FAQ />
      <Ubicacion />
      <ContactoCTA />
    </>
  );
}
