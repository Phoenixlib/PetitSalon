import { prisma } from "@/lib/prisma";
import ServiciosClient from "./ServiciosClient";

export const metadata = {
  title: "Servicios — Petit Salón Admin",
};

export default async function ServiciosPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: [{ order: "asc" }],
    include: {
      services: {
        orderBy: [{ order: "asc" }],
      },
    },
  });

  const uncategorized = await prisma.service.findMany({
    where: { categoryId: null },
    orderBy: [{ order: "asc" }],
  });

  return (
    <ServiciosClient categories={categories} uncategorized={uncategorized} />
  );
}
