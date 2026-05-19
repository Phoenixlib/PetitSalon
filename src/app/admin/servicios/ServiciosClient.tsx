"use client";

import { useState, useTransition } from "react";
import { toggleServiceAction, deleteServiceAction, deleteCategoryAction, reorderCategoriesAction, reorderServicesAction } from "./actions";
import ServiceModal from "@/components/admin/ServiceModal";
import CategoryModal from "@/components/admin/CategoryModal";

function CalComHelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden"
      style={{ border: "1px solid #ddd6fe", backgroundColor: "#faf5ff" }}
    >
      {/* Header clickeable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-purple-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📅</span>
          <span className="text-sm font-semibold" style={{ color: "#6d28d9" }}>
            ¿Cómo vincular un Event Type de Cal.com con un servicio?
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="#6d28d9"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenido expandible */}
      {open && (
        <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: "#ddd6fe" }}>
          <div className="space-y-4 text-sm" style={{ color: "#374151" }}>

            {/* Paso 1 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "#6d28d9" }}>
                Paso 1 — Identificar el nombre del evento en Cal.com
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Ve a <strong>app.cal.com → Event Types</strong> y anota el nombre exacto del evento que quieres vincular.
                Por ejemplo: <code className="bg-purple-100 text-purple-800 rounded px-1 py-0.5 text-[11px]">Baño y Secado Perro Pequeño</code>
              </p>
            </div>

            {/* Paso 2 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "#6d28d9" }}>
                Paso 2 — Editar el servicio correspondiente
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Busca el servicio en esta página y haz clic en <strong>"Editar"</strong>. Si no existe, crea uno nuevo con el botón <strong>"Nuevo Servicio"</strong>.
              </p>
            </div>

            {/* Paso 3 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "#6d28d9" }}>
                Paso 3 — Llenar el campo "Enlace de Cal.com"
              </p>
              <p className="text-xs leading-relaxed text-gray-600 mb-2">
                Dentro del formulario, tienes dos opciones:
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="rounded-xl p-3" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p className="text-xs font-semibold text-green-700 mb-1">✅ Opción A — Nombre del evento (simple)</p>
                  <p className="text-[11px] text-green-800 leading-relaxed">
                    Escribe el nombre exacto del Event Type tal como aparece en Cal.com.<br/>
                    <span className="font-mono bg-green-100 rounded px-1">Baño y Secado Perro Pequeño</span>
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <p className="text-xs font-semibold text-blue-700 mb-1">✅ Opción B — Slug del URL (técnico)</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Copia la parte del link de Cal.com después de <span className="font-mono">cal.com/</span><br/>
                    <span className="font-mono bg-blue-100 rounded px-1">petitsalon/bano-y-secado</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 4 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "#6d28d9" }}>
                Paso 4 — Guardar y verificar
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Guarda los cambios. Para verificar, haz una reserva de prueba en Cal.com y comprueba que aparezca en
                <strong> Citas</strong> con el servicio correcto asignado.
              </p>
            </div>

            {/* Advertencia */}
            <div className="rounded-xl px-4 py-3 flex gap-2.5" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="text-[11px] leading-relaxed" style={{ color: "#92400e" }}>
                Si no se configura este campo y el nombre del servicio no coincide con el nombre del evento, el sistema asignará la cita
                al <strong>primer servicio activo</strong> de la lista por defecto.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  isActive: boolean;
  order: number;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  services: Service[];
};

type Props = {
  categories: Category[];
  uncategorized: Service[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ServiciosClient({ categories, uncategorized }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [defaultCatId, setDefaultCatId] = useState<string | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // -- Services --
  const handleNewService = (categoryId: string | null = null) => {
    setEditingService(null);
    setDefaultCatId(categoryId);
    setModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setDefaultCatId(service.categoryId);
    setModalOpen(true);
  };

  const handleToggleService = (id: string, currentActive: boolean) => {
    startTransition(() => {
      toggleServiceAction(id, !currentActive);
    });
  };

  const handleDeleteService = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await deleteServiceAction(id);
      if ("error" in result) setErrorMsg(result.error);
    });
  };

  // -- Categories --
  const handleNewCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if ("error" in result) setErrorMsg(result.error);
    });
  };

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === categories.length - 1) return;

    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap elements
    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];

    const categoryIds = newCategories.map((c) => c.id);

    startTransition(async () => {
      const result = await reorderCategoriesAction(categoryIds);
      if (!result.success && result.error) setErrorMsg(result.error);
    });
  };

  const handleMoveService = (
    categoryServices: Service[],
    serviceIndex: number,
    direction: "up" | "down",
  ) => {
    if (direction === "up" && serviceIndex === 0) return;
    if (direction === "down" && serviceIndex === categoryServices.length - 1)
      return;

    const newServices = [...categoryServices];
    const targetIndex = direction === "up" ? serviceIndex - 1 : serviceIndex + 1;

    [newServices[serviceIndex], newServices[targetIndex]] = [
      newServices[targetIndex],
      newServices[serviceIndex],
    ];

    const serviceIds = newServices.map((s) => s.id);

    startTransition(async () => {
      const result = await reorderServicesAction(serviceIds);
      if (!result.success && result.error) setErrorMsg(result.error);
    });
  };

  const allCategoriesForSelect = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--ps-text)" }}
          >
            Servicios
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
            Añade servicios y organízalos por categoría.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewCategory}
            className="rounded-full px-4 py-2 text-sm font-semibold border border-neutral-300 shadow-sm transition-all hover:bg-neutral-50"
            style={{ color: "var(--ps-text)" }}
          >
            + Nueva Categoría
          </button>
          <button
            onClick={() => handleNewService(null)}
            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Nuevo Servicio
          </button>
        </div>
      </div>

      <CalComHelpPanel />

      {errorMsg && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3"
          style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((category, index) => (
          <div key={category.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <div className="px-4 py-3 lg:px-5 lg:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3" style={{ backgroundColor: "var(--ps-lila-pale)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex-1">
                <div className="flex items-center justify-between lg:justify-start gap-2">
                  <h2 className="text-base lg:text-lg font-semibold flex items-center gap-2" style={{ color: "var(--ps-text)" }}>
                    📁 {category.name}
                  </h2>
                  <div className="flex items-center gap-1 lg:hidden">
                    <button
                      onClick={() => handleMoveCategory(index, "up")}
                      disabled={isPending || index === 0}
                      className="rounded-lg p-1.5 text-xs font-medium bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 shadow-sm"
                      title="Mover Arriba"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveCategory(index, "down")}
                      disabled={isPending || index === categories.length - 1}
                      className="rounded-lg p-1.5 text-xs font-medium bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 shadow-sm mr-2"
                      title="Mover Abajo"
                    >
                      ▼
                    </button>

                    <button
                      onClick={() => handleEditCategory(category)}
                      className="rounded-lg p-1.5 text-xs font-medium bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                      title="Editar Categoría"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-xs font-medium text-red-600 bg-white border border-neutral-200 hover:bg-red-50 disabled:opacity-50 shadow-sm"
                      title="Eliminar Categoría"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-xs lg:text-sm mt-1 text-slate-600">{category.description}</p>
                )}
              </div>
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center border-r border-neutral-300 pr-2 mr-1">
                  <button
                    onClick={() => handleMoveCategory(index, "up")}
                    disabled={isPending || index === 0}
                    className="rounded-lg p-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                    title="Mover Arriba"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveCategory(index, "down")}
                    disabled={isPending || index === categories.length - 1}
                    className="rounded-lg p-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 disabled:opacity-30 transition-colors"
                    title="Mover Abajo"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={() => handleEditCategory(category)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium bg-white border border-neutral-200 hover:bg-neutral-50"
                >
                  Editar Categoría
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isPending}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-neutral-200 hover:bg-red-50 disabled:opacity-50"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="bg-white divide-y" style={{ borderColor: "var(--border)" }}>
              {category.services.map((s, serviceIndex) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  serviceIndex={serviceIndex}
                  totalServices={category.services.length}
                  onEdit={handleEditService}
                  onToggle={handleToggleService}
                  onDelete={handleDeleteService}
                  onMoveUp={() =>
                    handleMoveService(category.services, serviceIndex, "up")
                  }
                  onMoveDown={() =>
                    handleMoveService(category.services, serviceIndex, "down")
                  }
                  isPending={isPending}
                />
              ))}
              {category.services.length === 0 && (
                <div className="p-4 text-sm text-center text-neutral-400">No hay servicios en esta categoría</div>
              )}
            </div>
            
            <div className="p-3 bg-neutral-50 border-t border-neutral-200">
              <button 
                onClick={() => handleNewService(category.id)}
                className="text-sm font-medium hover:underline text-[var(--primary)] flex items-center gap-1"
              >
                <span>+</span> Agregar servicio
              </button>
            </div>
          </div>
        ))}

        {/* Uncategorized */}
        {uncategorized.length > 0 && (
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--ps-text)" }}>📂 Sin Categoría</h2>
            </div>
            <div className="bg-white divide-y" style={{ borderColor: "var(--border)" }}>
              {uncategorized.map((s, serviceIndex) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  serviceIndex={serviceIndex}
                  totalServices={uncategorized.length}
                  onEdit={handleEditService}
                  onToggle={handleToggleService}
                  onDelete={handleDeleteService}
                  onMoveUp={() =>
                    handleMoveService(uncategorized, serviceIndex, "up")
                  }
                  onMoveDown={() =>
                    handleMoveService(uncategorized, serviceIndex, "down")
                  }
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <ServiceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          service={editingService}
          categories={allCategoriesForSelect}
          defaultCategoryId={defaultCatId}
        />
      )}
      
      {categoryModalOpen && (
        <CategoryModal
          open={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          category={editingCategory}
        />
      )}
    </>
  );
}

function ServiceRow({
  service,
  serviceIndex,
  totalServices,
  onEdit,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isPending,
}: {
  service: Service;
  serviceIndex: number;
  totalServices: number;
  onEdit: (s: Service) => void;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isPending: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* Indicador de estado */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 sm:mt-0"
          style={{ backgroundColor: service.isActive ? "var(--primary)" : "#ccc" }}
        />

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start sm:block">
            <p
              className="font-bold text-sm sm:text-base text-gray-900 truncate"
              style={{ opacity: service.isActive ? 1 : 0.6 }}
            >
              {service.name}
            </p>
            {/* Precio y duración móvil */}
            <div className="sm:hidden flex flex-col items-end shrink-0 ml-2 text-right">
              <span className="text-xs font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded">
                {formatPrice(service.price)}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">{service.duration} min</span>
            </div>
          </div>
          {service.description && (
            <p className="text-xs text-gray-500 line-clamp-2 sm:truncate mt-0.5 leading-relaxed pr-4 sm:pr-0">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Precio y duración desktop */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 ml-4 mr-4">
        <span className="text-sm font-semibold" style={{ color: "var(--ps-text)" }}>
          {formatPrice(service.price)}
        </span>
        <span className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
          {service.duration} min
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
        {/* Flechas de orden */}
        <div className="flex flex-col gap-0.5 mr-1">
          <button
            onClick={onMoveUp}
            disabled={isPending || serviceIndex === 0}
            className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-25 transition-colors leading-none text-[10px]"
            title="Mover arriba"
          >
            ▲
          </button>
          <button
            onClick={onMoveDown}
            disabled={isPending || serviceIndex === totalServices - 1}
            className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-25 transition-colors leading-none text-[10px]"
            title="Mover abajo"
          >
            ▼
          </button>
        </div>

        <button
          onClick={() => onToggle(service.id, service.isActive)}
          disabled={isPending}
          className={`flex-1 sm:flex-none rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50 text-center ${
            service.isActive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
          }`}
        >
          {service.isActive ? "Ocultar" : "Mostrar"}
        </button>

        <button
          onClick={() => onEdit(service)}
          className="flex-1 sm:flex-none rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition-colors bg-gray-50 hover:bg-gray-100 text-gray-700 text-center"
        >
          Editar
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1 flex-1 sm:flex-none justify-end">
            <button
              onClick={() => { onDelete(service.id); setConfirmDelete(false); }}
              disabled={isPending}
              className="rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Sí
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="rounded-lg p-1.5 transition-colors bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 text-gray-400"
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
