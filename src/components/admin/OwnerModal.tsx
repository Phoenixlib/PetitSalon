"use client";

import { useEffect, useActionState } from "react";
import { updateOwnerAction, OwnerFormState } from "@/app/admin/clientes/actions";
import { motion, AnimatePresence } from "framer-motion";

export default function OwnerModal({
  owner,
  isOpen,
  onClose,
}: {
  owner: { id: string; name: string; phone: string; email: string | null };
  isOpen: boolean;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<OwnerFormState, FormData>(
    updateOwnerAction.bind(null, owner.id),
    {}
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--border)" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
                Editar Cliente
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-black/5 transition-colors"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>
                  Nombre
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={owner.name}
                  required
                  className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ borderColor: "var(--border)" }}
                />
                {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={owner.phone}
                  required
                  className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ borderColor: "var(--border)" }}
                />
                {state.errors?.phone && <p className="text-xs text-red-500">{state.errors.phone[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={owner.email || ""}
                  className="w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ borderColor: "var(--border)" }}
                />
                {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
              </div>

              {state.errors?._form && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {state.errors._form[0]}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-4" style={{ borderColor: "var(--border)" }}>
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
                  disabled={pending}
                  className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {pending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
