import { prisma } from "@/lib/prisma";
import CitasClient from "./CitasClient";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import Link from "next/link";

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

  // Ejecutar queries de manera secuencial para evitar ECONNRESET en PrismaNeon
  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
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

  const totalCount = await prisma.appointment.count({ where });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl lg:text-3xl font-bold tracking-tight"
            style={{ color: "var(--ps-text)" }}
          >
            Citas
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
            Historial y gestión de todas las citas.
          </p>
        </div>
        <Link
          href="/admin/citas/nueva"
          className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md text-center sm:px-4 sm:py-2 sm:rounded-lg sm:font-medium sm:shadow-sm"
        >
          + Nueva Cita
        </Link>
      </div>
      <CitasClient
        initialAppointments={appointments}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        currentSearch={q}
        currentStatus={status}
      />
    </div>
  );
}
