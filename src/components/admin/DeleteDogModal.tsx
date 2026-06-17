"use client";

import { useState } from "react";
import { deleteDogAction } from "@/app/admin/perros/actions";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteDogModal({
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setPending(true);
    setError(null);
    const result = await deleteDogAction(dogId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setPending(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-6 py-4 bg-red-50" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold text-red-600">Archivar Mascota</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-red-100 transition-colors text-red-800">✕</button>
        </div>

        <div className="p-6">
          <p className="text-neutral-600 mb-4">
            ¿Estás seguro de que deseas archivar a <strong>{dogName}</strong>? La mascota ya no aparecerá en las listas ni podrá agendar nuevas citas, pero su historial de atenciones se mantendrá intacto.
          </p>
          
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 mb-4">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={pending}
              className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 disabled:opacity-50" 
              style={{ color: "var(--ps-text-mid)" }}
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={pending} 
              className="px-6 py-2 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {pending ? "Archivando..." : "Archivar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
