import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GaleriaAdmin from "./GaleriaAdmin";

export const metadata = { title: "Galería — Petit Salón Admin" };

export default async function GaleriaAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      photoUrl: true,
      caption: true,
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
          Galería de Trabajos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
          Administra las fotos de resultados de atenciones que aparecen en el Landing Page.
        </p>
      </div>

      <GaleriaAdmin initialPhotos={photos} />
    </div>
  );
}
