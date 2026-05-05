"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    status: string;
    dogName: string;
    dogBreed: string;
    dogSize: string | null;
    ownerName: string;
    ownerPhone: string;
    serviceName: string;
    price: number;
    notes: string | null;
  };
}

type AppointmentStatus = "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  DONE: "#22c55e",
  CANCELLED: "#9ca3af",
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/admin/appointments");
    const data = (await res.json()) as CalendarEvent[];
    setEvents(data);
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  function handleEventClick(info: EventClickArg) {
    setSelected(info.event.toPlainObject() as unknown as CalendarEvent);
  }

  async function handleEventDrop(info: EventDropArg) {
    // Optimistic update — the API PATCH doesn't support date changes yet,
    // so we just refresh from server after drop to show current state.
    info.revert(); // revert until we have a date-update endpoint
  }

  async function changeStatus(id: string, status: AppointmentStatus) {
    setUpdating(true);
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchEvents();
      setSelected(null);
    } finally {
      setUpdating(false);
    }
  }

  const calRef = useRef<FullCalendar>(null);

  return (
    <div className="relative">
      {/* Calendar */}
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="es"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          list: "Lista",
        }}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        editable={true}
        droppable={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        height="auto"
        allDaySlot={false}
        nowIndicator
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
      />

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4"
            style={{ backgroundColor: "white" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white mb-2"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[
                        selected.extendedProps.status as AppointmentStatus
                      ],
                  }}
                >
                  {
                    STATUS_LABELS[
                      selected.extendedProps.status as AppointmentStatus
                    ]
                  }
                </span>
                <h3
                  className="font-bold text-lg"
                  style={{ color: "var(--ps-text)" }}
                >
                  {selected.extendedProps.dogName}
                </h3>
                <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
                  {selected.extendedProps.dogBreed}
                  {selected.extendedProps.dogSize
                    ? ` — Talla ${selected.extendedProps.dogSize}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Details */}
            <div
              className="divide-y rounded-2xl overflow-hidden border"
              style={{ borderColor: "var(--ps-lila-pale)" }}
            >
              {[
                ["Servicio", selected.extendedProps.serviceName],
                [
                  "Precio",
                  `$${selected.extendedProps.price.toLocaleString("es-CL")} CLP`,
                ],
                [
                  "Fecha",
                  new Date(selected.start).toLocaleString("es-CL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                ],
                ["Dueño", selected.extendedProps.ownerName],
                ["Teléfono", selected.extendedProps.ownerPhone],
                ...(selected.extendedProps.notes
                  ? [["Notas", selected.extendedProps.notes]]
                  : []),
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 px-3 py-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide w-20 shrink-0 pt-0.5"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    {k}
                  </span>
                  <span className="text-sm" style={{ color: "var(--ps-text)" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Status actions */}
            {selected.extendedProps.status !== "DONE" &&
              selected.extendedProps.status !== "CANCELLED" && (
                <div className="grid grid-cols-2 gap-2">
                  {selected.extendedProps.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => changeStatus(selected.id, "CONFIRMED")}
                      className="py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "#3b82f6" }}
                    >
                      Confirmar
                    </button>
                  )}
                  {selected.extendedProps.status === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => changeStatus(selected.id, "DONE")}
                      className="py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: "#22c55e" }}
                    >
                      Marcar realizada
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => changeStatus(selected.id, "CANCELLED")}
                    className="py-2.5 rounded-xl text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50"
                    style={{
                      color: "var(--ps-text-mid)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    Cancelar cita
                  </button>
                </div>
              )}

            {/* WhatsApp quick action */}
            <a
              href={`https://wa.me/${selected.extendedProps.ownerPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white w-full transition hover:opacity-90"
              style={{ backgroundColor: "#25d366" }}
            >
              Escribir al dueño por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
