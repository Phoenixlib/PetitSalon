import { prisma } from "@/lib/prisma";
import Servicios from "@/components/public/Servicios";

export const metadata = {
  title: "Servicios — Petit Salón",
  description:
    "Descubre todos nuestros servicios de peluquería canina: baño, corte, spa y más. Precios y duración en Santiago.",
};

export default async function ServiciosPage() {
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

  // Filtrar categorías sin servicios activos
  const categoriesWithServices = categories.filter(
    (c) => c.services.length > 0,
  );

  return (
    <div>
      {/* Hero de sección */}
      <section
        className="py-16 px-4 text-center"
        style={{ backgroundColor: "var(--ps-lila-pale)" }}
      >
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
        >
          Nuestros Servicios
        </h1>
        <p
          className="text-lg max-w-xl mx-auto"
          style={{ color: "var(--ps-text-mid)" }}
        >
          Todo lo que tu peludo necesita, con el amor y la dedicación que se
          merece.
        </p>
      </section>

      {/* Componente de servicios existente */}
      <Servicios
        categories={categoriesWithServices}
        uncategorizedServices={uncategorizedServices}
      />
    </div>
  );
}
