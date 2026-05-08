import { prisma } from "@/lib/prisma";
import ServiciosClient from "./ServiciosClient";

export const metadata = {
  title: "Servicios — Petit Salón Admin",
};

export default async function ServiciosPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return <ServiciosClient services={services} />;
}
