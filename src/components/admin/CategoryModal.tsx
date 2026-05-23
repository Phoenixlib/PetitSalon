"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  CategoryFormState,
} from "@/app/admin/servicios/actions";

type Category = {
  id: string;
  name: string;
  description: string | null;
  order: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
};

const initialState: CategoryFormState = {};

export default function CategoryModal({ open, onClose, category }: Props) {
  const isEditing = !!category;
  const boundUpdate = updateCategoryAction.bind(null, category?.id ?? "");

  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    boundUpdate,
    initialState,
  );

  const state = isEditing ? updateState : createState;
  const pending = isEditing ? updatePending : createPending;
  const action = isEditing ? updateAction : createAction;

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  // Reset state when closing/opening
  useEffect(() => {
    if (open && state.success) {
      // Small hack to force state reset. Usually you handle this differently.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100 transition-colors leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {state.errors?._form && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {state.errors._form[0]}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label
              htmlFor="category_name"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--ps-text)" }}
            >
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="category_name"
              name="name"
              type="text"
              defaultValue={category?.name ?? ""}
              required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ borderColor: "var(--border)" }}
            />
            {state.errors?.name && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.name[0]}
              </p>
            )}
          </div>


          {/* Descripción */}
          <div>
            <label
              htmlFor="category_desc"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--ps-text)" }}
            >
              Descripción
            </label>
            <textarea
              id="category_desc"
              name="description"
              defaultValue={category?.description ?? ""}
              rows={3}
              placeholder="Descripción opcional de la categoría..."
              className="w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
            />
            {state.errors?.description && (
              <p className="mt-1 text-xs text-red-500">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {pending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
