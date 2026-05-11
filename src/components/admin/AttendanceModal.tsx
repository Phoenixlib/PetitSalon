"use client";

import { useEffect, useActionState } from "react";
import { createAttendanceAction, AttendanceFormState } from "@/app/admin/perros/actions";
import { motion, AnimatePresence } from "framer-motion";

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
  const [state, formAction, pending] = useActionState<AttendanceFormState, FormData>(
    createAttendanceAction.bind(null, dogId),
    {}
  );

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  // Formatear fecha actual para el input datetime-local: YYYY-MM-DDThh:mm
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>Registrar Atención: {dogName}</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 transition-colors">✕</button>
            </div>

            <div className="p-6">
              <form action={formAction} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Servicio Realizado *</label>
                  <input name="service" type="text" required placeholder="ej. Baño y corte completo" className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
                  {state.errors?.service && <p className="text-xs text-red-500">{state.errors.service[0]}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Fecha Variante *</label>
                  <input name="date" type="datetime-local" required defaultValue={formatDateTime(new Date())} className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] text-sm" style={{ borderColor: "var(--border)" }} />
                  {state.errors?.date && <p className="text-xs text-red-500">{state.errors.date[0]}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Notas / Observaciones</label>
                  <textarea name="notes" rows={3} placeholder="Comportamiento, observaciones médicas, etc." className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }}></textarea>
                </div>

                {state.errors?._form && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.errors._form[0]}</p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t mt-4" style={{ borderColor: "var(--border)" }}>
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100" style={{ color: "var(--ps-text-mid)" }}>Cancelar</button>
                  <button type="submit" disabled={pending} className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {pending ? "Guardando..." : "Guardar Atención"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
