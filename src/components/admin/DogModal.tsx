"use client";

import { useEffect, useActionState } from "react";
import { updateDogAction, DogFormState } from "@/app/admin/perros/actions";
import { motion, AnimatePresence } from "framer-motion";
import { DogSize } from "@prisma/client";

export default function DogModal({
  dog,
  isOpen,
  onClose,
}: {
  dog: { id: string; name: string; breed: string; size: DogSize | null; age: string | null; weight: string | null; notes: string | null };
  isOpen: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<DogFormState, FormData>(
    updateDogAction.bind(null, dog.id),
    {}
  );

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>Editar Mascota</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Nombre *</label>
                <input name="name" type="text" defaultValue={dog.name} required className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
                {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Raza *</label>
                <input name="breed" type="text" defaultValue={dog.breed} required className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
                {state.errors?.breed && <p className="text-xs text-red-500">{state.errors.breed[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Tamaño</label>
                <select name="size" defaultValue={dog.size || ""} className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] bg-white" style={{ borderColor: "var(--border)" }}>
                  <option value="">Seleccione</option>
                  <option value="XS">Extra Pequeño (XS)</option>
                  <option value="S">Pequeño (S)</option>
                  <option value="M">Mediano (M)</option>
                  <option value="L">Grande (L)</option>
                  <option value="XL">Extra Grande (XL)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Edad</label>
                <input name="age" type="text" defaultValue={dog.age || ""} placeholder="ej. 2 años" className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Peso</label>
                <input name="weight" type="text" defaultValue={dog.weight || ""} placeholder="ej. 5 kg" className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Notas / Observaciones</label>
              <textarea name="notes" defaultValue={dog.notes || ""} rows={3} className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }}></textarea>
            </div>

            {state.errors?._form && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.errors._form[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-6" style={{ borderColor: "var(--border)" }}>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100" style={{ color: "var(--ps-text-mid)" }}>Cancelar</button>
              <button type="submit" disabled={pending} className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition-opacity">
                {pending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
