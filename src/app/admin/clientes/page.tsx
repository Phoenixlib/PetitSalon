import { prisma } from "@/lib/prisma";
import ClientesClient from "./ClientesClient";

interface SearchParams {
  q?: string;
  page?: string;
}

export default async function ClientesPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() ?? "";
  const page = parseInt(searchParams.page ?? "1", 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } as any },
          { phone: { contains: q, mode: "insensitive" } as any },
          { email: { contains: q, mode: "insensitive" } as any },
        ],
      }
    : undefined;

  // 1. Obtener los dueños paginados
  const owners = await prisma.owner.findMany({
    where,
    include: {
      dogs: { where: { isActive: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // 2. Obtener el total de clientes para calcular las páginas
  const totalCount = await prisma.owner.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <ClientesClient
      initialOwners={owners}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      currentSearch={q}
    />
  );
}

