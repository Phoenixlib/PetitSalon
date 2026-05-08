"use client";

import { useState, useTransition } from "react";
import { toggleServiceAction, deleteServiceAction } from "./actions";
import ServiceModal from "@/components/admin/ServiceModal";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  isActive: boolean;
};

type Props = {
  services: Service[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ServiciosClient({ services }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleNew = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(() => {
      toggleServiceAction(id, !currentActive);
    });
  };

  const handleDelete = (id: string) => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteServiceAction(id);
      if ("error" in result) setDeleteError(result.error);
    });
  };

  const active = services.filter((s) => s.isActive);
  const inactive = services.filter((s) => !s.isActive);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--ps-text)" }}
          >
            Servicios
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
            {active.length} activo{active.length !== 1 ? "s" : ""} ·{" "}
            {inactive.length} inactivo
            {inactive.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo servicio
        </button>
      </div>

      {/* Error de eliminación */}
      {deleteError && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3"
          style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
        >
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Tabla activos */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="px-5 py-3.5"
          style={{
            backgroundColor: "var(--ps-lila-pale)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--ps-text-mid)" }}
          >
            Activos ({active.length})
          </h2>
        </div>

        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: "var(--ps-text-mid)", opacity: 0.4 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
              No hay servicios activos. Crea uno nuevo.
            </p>
          </div>
        ) : (
          <div
            className="bg-white divide-y"
            style={{ borderColor: "var(--border)" }}
          >
            {active.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tabla inactivos */}
      {inactive.length > 0 && (
        <div
          className="mt-6 rounded-2xl overflow-hidden shadow-sm"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="px-5 py-3.5"
            style={{
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--ps-text-mid)" }}
            >
              Desactivados ({inactive.length})
            </h2>
          </div>
          <div
            className="bg-white divide-y"
            style={{ borderColor: "var(--border)" }}
          >
            {inactive.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={editingService}
      />
    </>
  );
}

function ServiceRow({
  service,
  onEdit,
  onToggle,
  onDelete,
  isPending,
}: {
  service: Service;
  onEdit: (s: Service) => void;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      {/* Indicador de estado */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: service.isActive ? "var(--primary)" : "#ccc",
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-sm truncate"
          style={{ color: service.isActive ? "var(--ps-text)" : "#999" }}
        >
          {service.name}
        </p>
        {service.description && (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "var(--ps-text-mid)" }}
          >
            {service.description}
          </p>
        )}
      </div>

      {/* Precio y duración */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0">
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--ps-text)" }}
        >
          {formatPrice(service.price)}
        </span>
        <span className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
          {service.duration} min
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(service)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
          style={{ color: "var(--ps-text-mid)" }}
        >
          Editar
        </button>
        <button
          onClick={() => onToggle(service.id, service.isActive)}
          disabled={isPending}
          className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={
            service.isActive
              ? { backgroundColor: "#fee2e2", color: "#dc2626" }
              : { backgroundColor: "#dcfce7", color: "#16a34a" }
          }
        >
          {service.isActive ? "Desactivar" : "Activar"}
        </button>

        {/* Eliminar con confirmación inline */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(service.id); setConfirmDelete(false); }}
              disabled={isPending}
              className="rounded-full px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              ¿Confirmar?
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-full px-2 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors"
              style={{ color: "var(--ps-text-mid)" }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="rounded-lg p-1.5 transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ color: "#dc2626" }}
            title="Eliminar servicio"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
