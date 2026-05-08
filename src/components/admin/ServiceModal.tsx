"use client";

import { useEffect, useActionState } from "react";
import { createServiceAction, updateServiceAction, ServiceFormState } from "@/app/admin/servicios/actions";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
};

const initialState: ServiceFormState = {};

export default function ServiceModal({ open, onClose, service }: Props) {
  const isEditing = !!service;

  const boundUpdate = updateServiceAction.bind(null, service?.id ?? "");

  const [createState, createAction, createPending] = useActionState(
    createServiceAction,
    initialState
  );
  const [updateState, updateAction, updatePending] = useActionState(
    boundUpdate,
    initialState
  );

  const state = isEditing ? updateState : createState;
  const action = isEditing ? updateAction : createAction;
  const pending = isEditing ? updatePending : createPending;

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--ps-text)" }}>
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
            style={{ color: "var(--ps-text-mid)" }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form action={action} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
              Nombre del servicio
            </label>
            <input
              name="name"
              type="text"
              defaultValue={service?.name ?? ""}
              placeholder="Ej: Baño y Secado"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
              style={{
                borderColor: "var(--border)",
                color: "var(--ps-text)",
                "--tw-ring-color": "var(--primary)",
              } as React.CSSProperties}
              required
            />
            {state.errors?.name && (
              <p className="text-xs text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Precio y Duración en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Precio (CLP)
              </label>
              <input
                name="price"
                type="number"
                defaultValue={service?.price ?? ""}
                placeholder="15000"
                min={0}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
                required
              />
              {state.errors?.price && (
                <p className="text-xs text-red-500">{state.errors.price[0]}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Duración (min)
              </label>
              <input
                name="duration"
                type="number"
                defaultValue={service?.duration ?? ""}
                placeholder="60"
                min={5}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
                required
              />
              {state.errors?.duration && (
                <p className="text-xs text-red-500">{state.errors.duration[0]}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
              Descripción{" "}
              <span style={{ color: "var(--ps-text-mid)", fontWeight: 400 }}>
                (opcional)
              </span>
            </label>
            <textarea
              name="description"
              defaultValue={service?.description ?? ""}
              placeholder="Describe brevemente qué incluye este servicio..."
              rows={3}
              className="resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
            />
            {state.errors?.description && (
              <p className="text-xs text-red-500">{state.errors.description[0]}</p>
            )}
          </div>

          {state.errors?._form && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.errors._form[0]}
            </p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: "var(--ps-text-mid)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
