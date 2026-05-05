import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/appointments
 * Devuelve todas las citas para FullCalendar (admin autenticado).
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    include: {
      dog: { include: { owner: true } },
      service: true,
    },
    orderBy: { date: "asc" },
  });

  // Formato compatible con FullCalendar
  const events = appointments.map((a) => ({
    id: a.id,
    title: `${a.dog.name} — ${a.service.name}`,
    start: a.date.toISOString(),
    end: new Date(a.date.getTime() + a.service.duration * 60_000).toISOString(),
    extendedProps: {
      status: a.status,
      dogName: a.dog.name,
      dogBreed: a.dog.breed,
      dogSize: a.dog.size,
      ownerName: a.dog.owner.name,
      ownerPhone: a.dog.owner.phone,
      serviceName: a.service.name,
      price: a.service.price,
      notes: a.notes,
    },
    color: STATUS_COLORS[a.status],
  }));

  return NextResponse.json(events);
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  DONE: "#22c55e",
  CANCELLED: "#9ca3af",
};

/**
 * GET /api/admin/appointments?from=ISO&to=ISO  (rango opcional)
 */
export async function POST(req: NextRequest) {
  // alias no utilizado — reservado para futuros filtros por rango
  void req;
  return NextResponse.json({ error: "Método no soportado" }, { status: 405 });
}
