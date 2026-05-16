"use client";

import { useTransition, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import {
  updateAppointmentStatusAction,
  markDoneWithAttendanceAction,
} from "@/app/admin/citas/actions";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

interface Props {
  appointment: AppointmentWithRelations | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  initialStep?: "detail" | "done-form" | "review-prompt";
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
  initialStep = "detail",
}: Props) {
  const [isPending, startTransition] = useTransition();

  type Step = "detail" | "done-form" | "review-prompt";
  const [step, setStep] = useState<Step>(initialStep);
  const [pendingFormData, setPendingFormData] = useState<{
    service: string;
    notes: string | null;
    photos: string[];
  } | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadFiles, error: uploadError } = useCloudinaryUpload();

  useEffect(() => {
    if (appointment) {
      setStep(initialStep);
      setPhotos([]);
      setPhotoPreviews([]);
    }
  }, [appointment?.id, initialStep]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...newFiles].slice(0, 6));
  };

  const handleRemoveFile = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleMarkDoneWithAttendance = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!appointment) return;

    const formData = new FormData(e.currentTarget);
    const service = formData.get("service") as string;
    const notes = formData.get("notes") as string;

    startTransition(async () => {
      const uploadedPhotos: string[] = [];

      if (photos.length > 0) {
        const results = await uploadFiles(photos);
        uploadedPhotos.push(...results.map((r) => r.secureUrl));
      }

      setPendingFormData({
        service,
        notes: notes || null,
        photos: uploadedPhotos,
      });
      setStep("review-prompt");
    });
  };

  const handleConfirmDone = (sendReview: boolean) => {
    if (!appointment) return;
    startTransition(async () => {
      const result = await markDoneWithAttendanceAction(
        appointment.id,
        pendingFormData,
        sendReview,
      );
      if (result.success) {
        onStatusChange(appointment.id, "DONE");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl relative"
        style={{ border: "1px solid var(--border)" }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {step === "detail" ? (
          <>
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
                <p
                  className="font-medium"
                  style={{ color: "var(--ps-text)" }}
                >
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
                <p
                  className="font-medium"
                  style={{ color: "var(--ps-text)" }}
                >
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
                    onClick={() => setStep("done-form")}
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
          </>
        ) : step === "done-form" ? (
          <>
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => setStep("detail")}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Volver"
              >
                ←
              </button>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--ps-text)" }}
              >
                ¿Qué se realizó en esta sesión?
              </h2>
            </div>

            <form
              onSubmit={handleMarkDoneWithAttendance}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--ps-text-mid)" }}
                >
                  Servicio Realizado *
                </label>
                <input
                  name="service"
                  type="text"
                  required
                  defaultValue={appointment.service.name}
                  className="w-full rounded-lg px-4 py-2 border focus:ring-2"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--ps-text-mid)" }}
                >
                  Notas / Observaciones
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Comportamiento, observaciones, etc."
                  className="w-full rounded-lg px-4 py-2 border"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--ps-text-mid)" }}
                >
                  Fotos (antes/después, máx. 6)
                </label>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed py-6 flex flex-col items-center gap-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-2xl">📷</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    Toca para seleccionar fotos
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    JPG, PNG, WEBP · Máx. 6 fotos · 10 MB por foto
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold hover:bg-red-600"
                          aria-label="Eliminar foto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploading && (
                  <p
                    className="text-sm text-center py-2"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    Subiendo fotos…
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <button
                  type="submit"
                  disabled={isPending || uploading}
                  className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {uploading
                    ? "Subiendo fotos…"
                    : isPending
                      ? "Guardando…"
                      : "Guardar y Finalizar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingFormData(null);
                    setStep("review-prompt");
                  }}
                  disabled={isPending || uploading}
                  className="w-full rounded-full py-2.5 font-semibold text-gray-700 bg-gray-200 transition-opacity hover:bg-gray-300 disabled:opacity-50"
                >
                  Solo marcar como Realizado
                </button>
              </div>
            </form>
          </>
        ) : step === "review-prompt" ? (
          <>
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <span className="text-5xl">⭐</span>
              <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
                ¿Enviar link de reseña?
              </h2>
              <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
                ¿Deseas enviarle a{" "}
                <strong>{appointment.dog.owner.name}</strong> un link para que
                deje una reseña de la experiencia de{" "}
                <strong>{appointment.dog.name}</strong>?
              </p>
              {!appointment.dog.owner.email && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 w-full">
                  ⚠️ Este cliente no tiene email registrado. No se puede enviar el
                  link de forma automática.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {appointment.dog.owner.email && (
                <button
                  type="button"
                  onClick={() => handleConfirmDone(true)}
                  disabled={isPending}
                  className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {isPending ? "Guardando…" : "Sí, enviar link de reseña ✉️"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleConfirmDone(false)}
                disabled={isPending}
                className="w-full rounded-full py-2.5 font-semibold text-gray-700 bg-gray-200 transition-opacity hover:bg-gray-300 disabled:opacity-50"
              >
                {isPending ? "Guardando…" : "No, solo marcar como Realizado"}
              </button>
            </div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
