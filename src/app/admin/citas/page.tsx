import { prisma } from "@/lib/prisma";
import CitasClient from "./CitasClient";
import type { AppointmentWithRelations } from "@/types";
import Link from "next/link";

export const metadata = { title: "Citas — Petit Salón Admin" };

export default async function CitasPage() {
  const appointments: AppointmentWithRelations[] =
    await prisma.appointment.findMany({
      orderBy: { date: "desc" },
      take: 200, // Las últimas 200 citas (paginación futura)
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
            owner: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        service: {
          select: { id: true, name: true, price: true, duration: true },
        },
      },
    });

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
      <CitasClient initialAppointments={appointments} />
    </div>
  );
}
