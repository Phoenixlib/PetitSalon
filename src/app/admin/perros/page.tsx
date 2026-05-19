import { prisma } from "@/lib/prisma";
import PerrosClient from "./PerrosClient";

interface SearchParams {
  q?: string;
  page?: string;
}

export default async function PerrosPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() ?? "";
  const page = parseInt(searchParams.page ?? "1", 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } as any },
          { breed: { contains: q, mode: "insensitive" } as any },
          { owner: { name: { contains: q, mode: "insensitive" } } as any },
        ],
      }
    : undefined;

  // 1. Obtener los perros paginados
  const dogs = await prisma.dog.findMany({
    where,
    include: {
      owner: true,
      _count: { select: { attendances: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // 2. Obtener el conteo total para calcular páginas
  const totalCount = await prisma.dog.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <PerrosClient
      initialDogs={dogs}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      currentSearch={q}
    />
  );
}
