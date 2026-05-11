import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Debe proveer correo electrónico o teléfono" },
      { status: 400 },
    );
  }

  try {
    const owner = await prisma.owner.findFirst({
      where: {
        OR: [
          ...(email
            ? [{ email: { equals: email, mode: "insensitive" as const } }]
            : []),
          ...(phone ? [{ phone: { contains: phone } }] : []),
        ],
      },
      include: {
        dogs: {
          select: { id: true, name: true, breed: true, size: true },
        },
      },
    });

    if (!owner) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
      },
      dogs: owner.dogs,
    });
  } catch (error) {
    console.error("[Booking Lookup Error]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
