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
import { AnimatePresence } from "framer-motion";

interface Props {
  initialAppointments: AppointmentWithRelations[];
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

export default function AgendaCalendar({ initialAppointments }: Props) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<EventInput[]>(
    initialAppointments.map(appointmentToEvent),
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDatesSet = useCallback(
    async ({ startStr, endStr }: { startStr: string; endStr: string }) => {
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

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = arg.event.extendedProps
      .appointment as AppointmentWithRelations;
    setSelectedAppointment(appointment);
  };

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
        timeZone="America/Santiago"
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        height={700}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
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
      </AnimatePresence>
    </div>
  );
}
