"use client";

import { useState, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import AppointmentDetailModal from "./AppointmentDetailModal";
import NuevaCitaModal from "./NuevaCitaModal";
import { AnimatePresence } from "framer-motion";
import { Plus, CalendarRange } from "lucide-react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Props {
  initialAppointments: AppointmentWithRelations[];
  services: Service[];
}

function appointmentToEvent(a: AppointmentWithRelations): EventInput {
  const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> =
    {
      PENDING: { bg: "#fbbf24", text: "#78350f" },
      CONFIRMED: { bg: "#3b82f6", text: "#ffffff" },
      DONE: { bg: "#22c55e", text: "#ffffff" },
      CANCELLED: { bg: "#d1d5db", text: "#6b7280" },
    };
  const colors = STATUS_COLORS[a.status];

  const startObj = new Date(a.date);
  const endObj = new Date(startObj.getTime() + a.service.duration * 60000);

  const waMark = a.whatsappSentAt ? " ✓WA" : "";

  return {
    id: a.id,
    title: `🐾 ${a.dog.name} — ${a.dog.owner.name}${waMark}`,
    start: startObj.toISOString(),
    end: endObj.toISOString(),
    backgroundColor: colors.bg,
    borderColor: colors.bg,
    textColor: colors.text,
    extendedProps: { appointment: a },
  };
}

export default function AgendaCalendar({ initialAppointments, services }: Props) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EventInput[]>(
    initialAppointments.map(appointmentToEvent),
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [clickedDateStr, setClickedDateStr] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentRange, setCurrentRange] = useState<{ startStr: string; endStr: string } | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEvents(initialAppointments.map(appointmentToEvent));
  }, [initialAppointments]);

  const handleDatesSet = useCallback(
    async ({ startStr, endStr }: { startStr: string; endStr: string }) => {
      setCurrentRange({ startStr, endStr });
      try {
        const res = await fetch(
          `/api/admin/appointments?from=${startStr}&to=${endStr}`,
        );
        if (!res.ok) return;
        const data: AppointmentWithRelations[] = await res.json();
        setEvents(data.map(appointmentToEvent));
      } catch (err) {
        console.error("Error fetching appointments range", err);
      }
    },
    [],
  );

  const refetchEvents = useCallback(async () => {
    if (!currentRange) return;
    try {
      const res = await fetch(
        `/api/admin/appointments?from=${currentRange.startStr}&to=${currentRange.endStr}`,
      );
      if (!res.ok) return;
      const data: AppointmentWithRelations[] = await res.json();
      setEvents(data.map(appointmentToEvent));
    } catch (err) {
      console.error("Error refetching appointments", err);
    }
  }, [currentRange]);

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = arg.event.extendedProps
      .appointment as AppointmentWithRelations;
    setSelectedAppointment(appointment);
  };

  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setClickedDateStr(arg.dateStr);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    router.refresh();
    refetchEvents();
  }, [router, refetchEvents]);

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const app = ev.extendedProps?.appointment as AppointmentWithRelations;
          const updatedApp = { ...app, status: newStatus };
          return appointmentToEvent(updatedApp);
        }
        return ev;
      }),
    );
  };

  if (!mounted) {
    return (
      <div
        className="h-[600px] w-full rounded-xl animate-pulse"
        style={{ backgroundColor: "var(--ps-lila-pale)" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--ps-text)" }}>
            Gestión Rápida
          </h2>
          <p className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
            Agrega citas directamente o bloquea horarios en Cal.com.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Bloquear Hora */}
          <a
            href="https://app.cal.com/availability"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all border hover:bg-neutral-50 shadow-sm"
            style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
          >
            <CalendarRange className="w-3.5 h-3.5 text-[var(--secondary)]" />
            Bloquear Hora
          </a>
          {/* Agendar Cita */}
          <button
            onClick={() => {
              // YYYY-MM-DD local time string
              const d = new Date();
              const pad = (n: number) => String(n).padStart(2, '0');
              setClickedDateStr(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Agendar Cita
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:p-4">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (max-width: 1023px) {
            .fc .fc-toolbar.fc-header-toolbar {
              flex-direction: column;
              gap: 12px;
            }
            .fc .fc-toolbar-title {
              font-size: 1.25rem !important;
            }
            .fc .fc-button {
              padding: 0.4em 0.6em;
              font-size: 0.85em;
            }
            .fc .fc-timegrid-slot-label {
              font-size: 0.75rem;
            }
          }
        `,
          }}
        />
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={esLocale}
          timeZone="local"
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height={700}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          selectable={true}
          selectMirror={true}
        />

        <AnimatePresence>
          {selectedAppointment && (
            <AppointmentDetailModal
              appointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              onStatusChange={handleStatusChange}
              onAppointmentUpdate={(updated) => {
                setEvents((prev) =>
                  prev.map((ev) =>
                    ev.id === updated.id ? appointmentToEvent(updated) : ev,
                  ),
                );
                setSelectedAppointment(updated);
              }}
            />
          )}

          {isCreateModalOpen && (
            <NuevaCitaModal
              isOpen={isCreateModalOpen}
              onClose={() => {
                setIsCreateModalOpen(false);
                setClickedDateStr(null);
              }}
              initialDateStr={clickedDateStr}
              services={services}
              onSuccess={handleCreateSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

