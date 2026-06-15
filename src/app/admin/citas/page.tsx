import { prisma } from "@/lib/prisma";
import CitasClient from "./CitasClient";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import { getCalComScheduleAvailability } from "@/lib/calcom";

export const dynamic = "force-dynamic";
export const metadata = { title: "Citas — Petit Salón Admin" };

const ITEMS_PER_PAGE = 20;

export default async function CitasPage(props: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page ?? "1", 10) || 1;
  const q = searchParams.q?.trim() ?? "";
  const status = (searchParams.status ?? "ALL") as "ALL" | AppointmentStatus;

  const where: any = {};

  if (status !== "ALL") {
    where.status = status;
  } else {
    where.status = { not: "CANCELLED" };
  }

  if (q) {
    where.OR = [
      {
        dog: {
          name: { contains: q, mode: "insensitive" },
        },
      },
      {
        dog: {
          owner: {
            name: { contains: q, mode: "insensitive" },
          },
        },
      },
    ];
  }

  // Obtener todas las citas coincidentes (solo ids, status y date) para ordenar y paginar en memoria
  const matched = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      status: true,
      date: true,
    },
  });

  // Ordenar: activas (PENDING/CONFIRMED) primero, la fecha más cercana primero.
  // Luego inactivas (DONE/CANCELLED), la fecha más reciente primero.
  matched.sort((a, b) => {
    const aIsActive = a.status === "PENDING" || a.status === "CONFIRMED";
    const bIsActive = b.status === "PENDING" || b.status === "CONFIRMED";

    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (aIsActive) {
      return aTime - bTime;
    } else {
      return bTime - aTime;
    }
  });

  const totalCount = matched.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Paginar los resultados
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageMatches = matched.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pageIds = pageMatches.map((m) => m.id);

  // Consultar las relaciones completas solo para las citas de la página actual
  let appointments: AppointmentWithRelations[] = [];
  if (pageIds.length > 0) {
    const fetched = await prisma.appointment.findMany({
      where: {
        id: { in: pageIds },
      },
      select: {
        id: true,
        calComUid: true,
        date: true,
        status: true,
        notes: true,
        createdAt: true,
        whatsappSentAt: true,
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
    }) as AppointmentWithRelations[];

    // Mantener el orden exacto definido por pageIds
    appointments = pageIds
      .map((id) => fetched.find((app) => app.id === id))
      .filter(Boolean) as AppointmentWithRelations[];
  }

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
    },
  });

  const availabilityRules = await getCalComScheduleAvailability();

  return (
    <CitasClient
      initialAppointments={appointments}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      currentSearch={q}
      currentStatus={status}
      services={services}
      availabilityRules={availabilityRules}
    />
  );
}
