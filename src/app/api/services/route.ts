import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 },
    );
  }
}
