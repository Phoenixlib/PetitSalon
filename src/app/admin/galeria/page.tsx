import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GaleriaAdmin from "./GaleriaAdmin";

export const metadata = { title: "Galería — Petit Salón Admin" };

interface SearchParams {
  page?: string;
}

export default async function GaleriaAdminPage(props: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page ?? "1", 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  const photos = await prisma.galleryPhoto.findMany({
    orderBy: { order: "asc" },
    skip,
    take: limit,
    select: {
      id: true,
      photoUrl: true,
      caption: true,
      order: true,
      isVisible: true,
    },
  });

  const totalCount = await prisma.galleryPhoto.count();
  const totalPages = Math.ceil(totalCount / limit);

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

      <GaleriaAdmin
        initialPhotos={photos}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}

