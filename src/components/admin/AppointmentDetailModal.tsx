"use client";

import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import { updateAppointmentStatusAction } from "@/app/admin/citas/actions";

interface Props {
  appointment: AppointmentWithRelations | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#fbbf24", text: "#78350f" },
  CONFIRMED: { bg: "#3b82f6", text: "#ffffff" },
  DONE: { bg: "#22c55e", text: "#ffffff" },
  CANCELLED: { bg: "#d1d5db", text: "#6b7280" },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function AppointmentDetailModal({
  appointment,
  onClose,
  onStatusChange,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(
        appointment.id,
        newStatus,
        {},
      );
      if (result.success) {
        onStatusChange(appointment.id, newStatus);
        onClose();
      }
    });
  };

  if (!appointment) return null;

  const dateObj = new Date(appointment.date);
  const dateFormatted = dateObj.toLocaleDateString("es-CL", {
    timeZone: "America/Santiago",
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = dateObj.toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const colors = STATUS_COLORS[appointment.status];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative"
          style={{ border: "1px solid var(--border)" }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold z-10 transition-opacity hover:opacity-70 bg-gray-100"
            style={{ color: "var(--ps-text)" }}
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="mb-4">
            <h2
              className="text-2xl font-semibold"
              style={{ color: "var(--ps-text)" }}
            >
              {appointment.dog.name}
            </h2>
            <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
              {appointment.dog.breed}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex gap-2 items-center text-sm">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>

            <div>
              <h3
                className="text-xs uppercase font-semibold"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Dueño
              </h3>
              <p className="font-medium" style={{ color: "var(--ps-text)" }}>
                {appointment.dog.owner.name}
              </p>
              <a
                href={`tel:${appointment.dog.owner.phone}`}
                className="text-sm text-blue-500 hover:underline"
              >
                {appointment.dog.owner.phone}
              </a>
            </div>

            <div>
              <h3
                className="text-xs uppercase font-semibold"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Servicio
              </h3>
              <p className="font-medium" style={{ color: "var(--ps-text)" }}>
                {appointment.service.name}
              </p>
              <p className="text-sm" style={{ color: "var(--ps-text)" }}>
                {formatPrice(appointment.service.price)} •{" "}
                {appointment.service.duration} min
              </p>
            </div>

            <div>
              <h3
                className="text-xs uppercase font-semibold"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Fecha y Hora
              </h3>
              <p
                className="font-medium capitalize"
                style={{ color: "var(--ps-text)" }}
              >
                {dateFormatted}
              </p>
              <p className="text-sm" style={{ color: "var(--ps-text)" }}>
                {timeFormatted}
              </p>
            </div>

            {appointment.notes && (
              <div>
                <h3
                  className="text-xs uppercase font-semibold"
                  style={{ color: "var(--ps-text-mid)" }}
                >
                  Notas
                </h3>
                <p
                  className="text-sm p-3 rounded-lg bg-gray-50 border border-gray-100"
                  style={{ color: "var(--ps-text)" }}
                >
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-6">
            {appointment.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("CONFIRMED")}
                  disabled={isPending}
                  className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: STATUS_COLORS["CONFIRMED"].bg }}
                >
                  Confirmar Cita
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={isPending}
                  className="w-full rounded-full py-2.5 font-semibold text-gray-700 bg-gray-200 transition-opacity hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar Cita
                </button>
              </>
            )}

            {appointment.status === "CONFIRMED" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("DONE")}
                  disabled={isPending}
                  className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: STATUS_COLORS["DONE"].bg }}
                >
                  Marcar como Realizado
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("CANCELLED")}
                  disabled={isPending}
                  className="w-full rounded-full py-2.5 font-semibold text-gray-700 bg-gray-200 transition-opacity hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar Cita
                </button>
              </>
            )}

            {(appointment.status === "DONE" ||
              appointment.status === "CANCELLED") && (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full py-2.5 font-semibold text-gray-700 bg-gray-200 transition-opacity hover:bg-gray-300"
              >
                Cerrar
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
