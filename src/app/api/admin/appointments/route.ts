import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseIncomingDate } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from"); // ISO string opcional
  const to = searchParams.get("to"); // ISO string opcional
  const status = searchParams.get("status"); // AppointmentStatus opcional

  const where: Record<string, unknown> = {};

  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = parseIncomingDate(from);
    if (to) (where.date as Record<string, unknown>).lte = parseIncomingDate(to);
  }

  if (
    status &&
    ["PENDING", "CONFIRMED", "DONE", "CANCELLED"].includes(status)
  ) {
    where.status = status;
  } else {
    where.status = { not: "CANCELLED" };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: "asc" },
    select: {
      id: true,
      calComUid: true,
      date: true,
      status: true,
      notes: true,
      createdAt: true,
      dog: {
        select: {
          id: true,
          name: true,
          breed: true,
          owner: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      },
      service: {
        select: { id: true, name: true, price: true, duration: true },
      },
    },
  });

  return NextResponse.json(appointments);
}
