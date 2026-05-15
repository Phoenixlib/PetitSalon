"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import {
  createAttendanceAction,
  AttendanceFormState,
} from "@/app/admin/perros/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

export default function AttendanceModal({
  dogId,
  dogName,
  isOpen,
  onClose,
}: {
  dogId: string;
  dogName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<AttendanceFormState["errors"]>({});

  const { uploading, uploadFiles, error: uploadError } = useCloudinaryUpload();

  // Estado de fotos seleccionadas (previsualizaciones locales antes de subir)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = isPending || uploading;

  useEffect(() => {
    if (!isOpen) {
      // Limpiar estado al cerrar
      setSelectedFiles([]);
      setPreviews([]);
      setErrors({});
    }
  }, [isOpen]);

  // Limpiar previsualizaciones cuando cambian los archivos
  useEffect(() => {
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 6)); // añade y limita a 6
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setErrors({});
    const formData = new FormData(formRef.current);

    // 1. Subir fotos a Cloudinary si hay archivos seleccionados (fuera de startTransition)
    if (selectedFiles.length > 0) {
      const uploaded = await uploadFiles(selectedFiles);
      uploaded.forEach((result, i) => {
        formData.append(`photos[${i}]`, result.secureUrl);
      });
    }

    // 2. Llamar a la Server Action con el FormData dentro de startTransition
    startTransition(async () => {
      const result = await createAttendanceAction(dogId, {}, formData);
      if (result?.success) {
        onClose();
      } else if (result?.errors) {
        setErrors(result.errors);
      }
    });
  };

  const formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10"
          style={{
            backgroundColor: "var(--ps-lila-pale)",
            borderColor: "var(--border)",
          }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--ps-text)" }}
          >
            Registrar Atención: {dogName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Servicio */}
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
                placeholder="ej. Baño y corte completo"
                className="w-full rounded-lg px-4 py-2 border focus:ring-2"
                style={{ borderColor: "var(--border)" }}
              />
              {errors?.service && (
                <p className="text-xs text-red-500">{errors.service[0]}</p>
              )}
            </div>

            {/* Campo: Fecha */}
            <div className="space-y-1">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Fecha y Hora *
              </label>
              <input
                name="date"
                type="datetime-local"
                required
                defaultValue={formatDateTime(new Date())}
                className="w-full rounded-lg px-4 py-2 border text-sm"
                style={{ borderColor: "var(--border)" }}
              />
              {errors?.date && (
                <p className="text-xs text-red-500">{errors.date[0]}</p>
              )}
            </div>

            {/* Campo: Notas */}
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

            {/* Zona de Fotos */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Fotos (antes/después, máx. 6)
              </label>

              {/* Dropzone */}
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

              {/* Previsualización */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, i) => (
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

            {errors?._form && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors._form[0]}
              </p>
            )}

            {/* Botones */}
            <div
              className="flex justify-end gap-3 pt-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-full text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {uploading
                  ? "Subiendo fotos…"
                  : isPending
                    ? "Guardando…"
                    : "Guardar Atención"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
