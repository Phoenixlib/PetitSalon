import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GaleriaAdmin from "./GaleriaAdmin";

export const metadata = { title: "Galería — Petit Salón Admin" };

export default async function GaleriaAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const pairs = await prisma.galleryPair.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      beforeUrl: true,
      afterUrl: true,
      breed: true,
      order: true,
      isVisible: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--ps-text)" }}
        >
          Galería Antes & Después
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
          Administra los pares de fotos que aparecen en el Landing Page.
        </p>
      </div>

      <GaleriaAdmin initialPairs={pairs} />
    </div>
  );
}
