import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ owners: [] });
  }

  // Buscar owners cuyo nombre coincida O que tengan un dog cuyo nombre coincida
  const owners = await prisma.owner.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        {
          dogs: {
            some: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: {
      dogs: {
        select: {
          id: true,
          name: true,
          breed: true,
          size: true,
        },
      },
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  // Solo devolver los campos necesarios (sin datos sensibles completos)
  const result = owners.map((o) => ({
    id: o.id,
    name: o.name,
    phone: o.phone,
    email: o.email,
    dogs: o.dogs,
  }));

  return NextResponse.json({ owners: result });
}
