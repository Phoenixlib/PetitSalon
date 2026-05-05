import type { Metadata } from "next";
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <AcercaDeNosotros />
      <Servicios />
      <Galeria />
      <Testimonios />
      <FAQ />
      <Ubicacion />
      <ContactoCTA />
    </>
  );
}
