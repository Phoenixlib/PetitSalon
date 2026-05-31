"use client";

import { useState, useEffect, useActionState } from "react";
import { motion } from "framer-motion";
import { createManualAppointmentAction, ManualAppointmentFormState } from "@/app/admin/citas/actions";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Dog {
  id: string;
  name: string;
  breed: string;
}

interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  dogs: Dog[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date | null;
  services: Service[];
  onSuccess: () => void;
}

function formatToLocalDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export default function NuevaCitaModal({
  isOpen,
  onClose,
  initialDate,
  services,
  onSuccess,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedDogId, setSelectedDogId] = useState("");

  const [state, formAction, pending] = useActionState<ManualAppointmentFormState, FormData>(
    createManualAppointmentAction,
    {}
  );

  // Debounced search for owners
  useEffect(() => {
    if (!searchQuery.trim()) {
      setOwners([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(`/api/admin/search-clients?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setOwners(data.owners || []);
        }
      } catch (err) {
        console.error("Error searching owners", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
      onClose();
    }
  }, [state?.success, onSuccess, onClose]);

  if (!isOpen) return null;

  const defaultDateStr = initialDate ? formatToLocalDatetimeLocal(initialDate) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
            Nueva Cita Manual
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
            style={{ color: "var(--ps-text-mid)" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Step 1: Owner Search & Select */}
          {!selectedOwner ? (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Buscar Dueño *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del dueño o de la mascota..."
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              />
              {loadingSearch && (
                <p className="text-xs animate-pulse" style={{ color: "var(--ps-text-mid)" }}>
                  Buscando...
                </p>
              )}
              {searchQuery && !loadingSearch && owners.length === 0 && (
                <p className="text-xs text-red-500">No se encontraron clientes.</p>
              )}
              {owners.length > 0 && (
                <div
                  className="border rounded-lg max-h-48 overflow-y-auto divide-y"
                  style={{ borderColor: "var(--border)" }}
                >
                  {owners.map((owner) => (
                    <button
                      key={owner.id}
                      type="button"
                      onClick={() => {
                        setSelectedOwner(owner);
                        if (owner.dogs.length > 0) {
                          setSelectedDogId(owner.dogs[0].id);
                        } else {
                          setSelectedDogId("");
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold" style={{ color: "var(--ps-text)" }}>
                          {owner.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
                          {owner.phone} {owner.email ? `| ${owner.email}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "var(--ps-lila-pale)", color: "var(--primary)" }}
                        >
                          {owner.dogs.length === 1 ? "1 mascota" : `${owner.dogs.length} mascotas`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="p-3 rounded-lg border flex items-center justify-between"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--ps-lila-pale)" }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--primary)" }}>
                  Cliente Seleccionado
                </p>
                <p className="font-bold text-sm" style={{ color: "var(--ps-text)" }}>
                  {selectedOwner.name}
                </p>
                <p className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
                  {selectedOwner.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOwner(null);
                  setSelectedDogId("");
                  setSearchQuery("");
                }}
                className="text-xs font-semibold underline hover:opacity-85"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Cambiar
              </button>
            </div>
          )}

          {/* Form for creation */}
          <form action={formAction} className="space-y-4">
            {/* Hidden Input for Dog ID */}
            <input type="hidden" name="dogId" value={selectedDogId} />

            {/* Select Mascota */}
            {selectedOwner && (
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                  Mascota *
                </label>
                {selectedOwner.dogs.length === 0 ? (
                  <p className="text-xs text-red-500 font-medium">
                    Este cliente no tiene mascotas registradas. Regístrala en la sección de Clientes primero.
                  </p>
                ) : (
                  <select
                    value={selectedDogId}
                    onChange={(e) => setSelectedDogId(e.target.value)}
                    required
                    className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] bg-white text-sm"
                    style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
                  >
                    {selectedOwner.dogs.map((dog) => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name} ({dog.breed})
                      </option>
                    ))}
                  </select>
                )}
                {state.errors?.dogId && <p className="text-xs text-red-500">{state.errors.dogId[0]}</p>}
              </div>
            )}

            {/* Select Servicio */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Servicio *
              </label>
              <select
                name="serviceId"
                required
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] bg-white text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              >
                <option value="">Selecciona un servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} min)
                  </option>
                ))}
              </select>
              {state.errors?.serviceId && <p className="text-xs text-red-500">{state.errors.serviceId[0]}</p>}
            </div>

            {/* Fecha y Hora */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Fecha y Hora *
              </label>
              <input
                name="date"
                type="datetime-local"
                defaultValue={defaultDateStr}
                required
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              />
              {state.errors?.date && <p className="text-xs text-red-500">{state.errors.date[0]}</p>}
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Estado *
              </label>
              <select
                name="status"
                required
                defaultValue="CONFIRMED"
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] bg-white text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
              </select>
              {state.errors?.status && <p className="text-xs text-red-500">{state.errors.status[0]}</p>}
            </div>

            {/* Notas */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Notas de la cita
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Detalles sobre el corte, temperamento, etc..."
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] text-sm"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              />
              {state.errors?.notes && <p className="text-xs text-red-500">{state.errors.notes[0]}</p>}
            </div>

            {state.errors?._form && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 font-medium">
                {state.errors._form[0]}
              </p>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !selectedOwner || selectedOwner.dogs.length === 0}
                className="px-6 py-2 rounded-full text-sm font-bold text-white transition-all bg-[var(--primary)] hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Guardando..." : "Crear Cita"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
