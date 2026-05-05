import type { Metadata } from "next";
import Hero from "@/components/public/Hero";
import Servicios from "@/components/public/Servicios";
import Galeria from "@/components/public/Galeria";
import Testimonios from "@/components/public/Testimonios";
import ContactoCTA from "@/components/public/ContactoCTA";

export const metadata: Metadata = {
  title: "Petit Salón | Peluquería Canina Premium",
  description:
    "Peluquería canina premium. Baño y secado, corte, corte de uñas con amor y profesionalismo. ¡Reserva tu turno hoy!",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Servicios />
      <Galeria />
      <Testimonios />
      <ContactoCTA />
    </>
  );
}
