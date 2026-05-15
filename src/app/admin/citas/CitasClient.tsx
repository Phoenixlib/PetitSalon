"use client";

import { useState, useTransition, useMemo } from "react";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import { updateAppointmentStatusAction } from "./actions";

interface Props {
  initialAppointments: AppointmentWithRelations[];
}

const TABS: { id: "ALL" | AppointmentStatus; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PENDING", label: "Pendientes" },
  { id: "CONFIRMED", label: "Confirmadas" },
  { id: "DONE", label: "Realizadas" },
  { id: "CANCELLED", label: "Canceladas" },
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  DONE: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function CitasClient({ initialAppointments }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activeTab, setActiveTab] = useState<"ALL" | AppointmentStatus>("ALL");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(id, newStatus, {});
      if (result.success) {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app,
          ),
        );
      }
    });
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // 1. Filtrar por Tab
      if (activeTab !== "ALL" && app.status !== activeTab) return false;

      // 2. Filtrar por Búsqueda (nombre perro o nombre dueño)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchDog = app.dog.name.toLowerCase().includes(query);
        const matchOwner = app.dog.owner.name.toLowerCase().includes(query);
        if (!matchDog && !matchOwner) return false;
      }

      return true;
    });
  }, [appointments, activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs de estado */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar perro o dueño..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha/Hora</th>
                <th className="px-6 py-4">Perro</th>
                <th className="px-6 py-4">Dueño / Teléfono</th>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No se encontraron citas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const dateObj = new Date(app.date);
                  const dateStr = dateObj.toLocaleDateString("es-CL", {
                    timeZone: "America/Santiago",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const timeStr = dateObj.toLocaleTimeString("es-CL", {
                    timeZone: "America/Santiago",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {dateStr}
                        </div>
                        <div className="text-gray-500">{timeStr}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {app.dog.name}
                        </div>
                        <div className="text-gray-500">{app.dog.breed}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {app.dog.owner.name}
                        </div>
                        <a
                          href={`tel:${app.dog.owner.phone}`}
                          className="text-blue-500 hover:underline"
                        >
                          {app.dog.owner.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900" title={app.service.name}>
                          {app.service.name.length > 25
                            ? app.service.name.substring(0, 22) + "..."
                            : app.service.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status]}`}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(app.id, "CONFIRMED")
                                }
                                disabled={isPending}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(app.id, "CANCELLED")
                                }
                                disabled={isPending}
                                className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {app.status === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(app.id, "DONE")
                                }
                                disabled={isPending}
                                className="text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                              >
                                Realizado
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(app.id, "CANCELLED")
                                }
                                disabled={isPending}
                                className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden flex flex-col divide-y divide-gray-100">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No se encontraron citas que coincidan con la búsqueda.
            </div>
          ) : (
            filteredAppointments.map((app) => {
              const dateObj = new Date(app.date);
              const dateStr = dateObj.toLocaleDateString("es-CL", {
                timeZone: "America/Santiago",
                weekday: "short",
                day: "2-digit",
                month: "short",
              });
              const timeStr = dateObj.toLocaleTimeString("es-CL", {
                timeZone: "America/Santiago",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              return (
                <div key={app.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 capitalize">{dateStr}</div>
                      <div className="text-sm font-medium text-gray-500">{timeStr}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mascota:</span>
                      <span className="font-medium text-gray-900">{app.dog.name} <span className="text-gray-500 font-normal">({app.dog.breed})</span></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dueño:</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 block">{app.dog.owner.name}</span>
                        <a href={`tel:${app.dog.owner.phone}`} className="text-blue-500 hover:underline">{app.dog.owner.phone}</a>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-1">
                      <span className="text-gray-500">Servicio:</span>
                      <span className="font-medium text-gray-900 truncate pl-2" title={app.service.name}>{app.service.name}</span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex gap-2 pt-1">
                    {app.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                          disabled={isPending}
                          className="flex-1 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "CANCELLED")}
                          disabled={isPending}
                          className="flex-1 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {app.status === "CONFIRMED" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(app.id, "DONE")}
                          disabled={isPending}
                          className="flex-1 text-sm font-semibold text-green-700 bg-green-100 hover:bg-green-200 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Completar
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "CANCELLED")}
                          disabled={isPending}
                          className="flex-1 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
