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

  // Leer configuración del sitio
  const configsDB = await prisma.siteConfig.findMany();
  const config = Object.fromEntries(configsDB.map((c) => [c.key, c.value]));

  // Leer FAQs activas
  const faqs = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, question: true, answer: true },
  });

  const defaultConfig = {
    whatsapp: "56937541863",
    email: "Petitsalon.contacto@gmail.com",
    address: "Carvajal 330, La Cisterna, Chile",
    parking: "true",
    about_text: "En <strong>Petit Salon</strong> priorizamos la atención personalizada, respetuosa y profesional, cuidando cada detalle para que tu mascota tenga una buena experiencia en su sesión.\n\nAtendemos cada requerimiento de sus tutores, salvaguardando primeramente el bienestar de la mascota. En un espacio seguro, <strong>sin caniles ni sedantes</strong>, con un horario dedicado solo para tu peludo.\n\nNo dudes en comunicarte con nosotros ante cualquier duda y con gusto te atenderemos.",
  };

  const merged = { ...defaultConfig, ...config };

  return (
    <>
      <Hero whatsapp={merged.whatsapp} />
      <AcercaDeNosotros
        about_text={merged.about_text}
        whatsapp={merged.whatsapp}
        email={merged.email}
        address={merged.address}
        parking={merged.parking === "true"}
      />
      <Servicios
        categories={categories}
        uncategorizedServices={uncategorizedServices}
      />
      <Galeria />
      <Testimonios />
      <FAQ items={faqs} whatsapp={merged.whatsapp} />
      <Ubicacion
        address={merged.address}
      />
      <ContactoCTA whatsapp={merged.whatsapp} />
    </>
  );
}
