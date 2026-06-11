"use client";

import { useState, useEffect, useActionState, useCallback } from "react";
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
  initialDateStr: string | null;
  services: Service[];
  onSuccess: () => void;
}

export default function NuevaCitaModal({
  isOpen,
  onClose,
  initialDateStr,
  services,
  onSuccess,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>("");  // "YYYY-MM-DD"
  const [selectedTime, setSelectedTime] = useState<string>("");  // "HH:MM"
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  // Handle server action success
  useEffect(() => {
    if (state?.success) {
      onSuccess();
      onClose();
    }
  }, [state?.success, onSuccess, onClose]);

  // Pre-fill date and time from initialDateStr
  useEffect(() => {
    if (initialDateStr && isOpen) {
      // initialDateStr can be "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss-04:00"
      const datePart = initialDateStr.substring(0, 10);
      setSelectedDate(datePart);

      if (initialDateStr.includes("T")) {
        const timePart = initialDateStr.substring(11, 16);
        if (timePart !== "00:00") {
          setSelectedTime(timePart);
        }
      }
    }
  }, [initialDateStr, isOpen]);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (!selectedDate || !selectedServiceId) {
      setSlots([]);
      setSelectedTime("");
      return;
    }

    const controller = new AbortController();
    setLoadingSlots(true);

    fetch(`/api/admin/available-slots?date=${selectedDate}&serviceId=${selectedServiceId}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        // Reset selected time if it's not in the new slot options (or if we want a fresh choice)
        setSelectedTime((prev) => {
          if (data.slots?.some((s: any) => s.time === prev && s.available)) {
            return prev;
          }
          return "";
        });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching slots", err);
        }
      })
      .finally(() => setLoadingSlots(false));

    return () => controller.abort();
  }, [selectedDate, selectedServiceId]);

  if (!isOpen) return null;

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
            className="rounded-full p-2 hover:bg-black/5 transition-colors cursor-pointer"
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
                  className="border rounded-lg max-h-48 overflow-y-auto divide-y bg-white"
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
                      className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm transition-colors flex justify-between items-center cursor-pointer"
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
                className="text-xs font-semibold underline hover:opacity-85 cursor-pointer"
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

            {/* Step 3: Select Servicio */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Servicio *
              </label>
              <select
                name="serviceId"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
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

            {/* Step 4: Fecha (Date Picker) */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Fecha *
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
              />
              {state.errors?.date && <p className="text-xs text-red-500">{state.errors.date[0]}</p>}
            </div>

            {/* Step 5: Slots de Hora Disponibles */}
            {selectedDate && selectedServiceId && (
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                  Hora disponible *
                </label>
                {loadingSlots ? (
                  <p className="text-xs animate-pulse font-medium" style={{ color: "var(--ps-text-mid)" }}>
                    Cargando horarios disponibles...
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-xs text-red-500 font-medium">No hay horarios disponibles para este día o servicio.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg bg-neutral-50" style={{ borderColor: "var(--border)" }}>
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-1.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                          !slot.available
                            ? "opacity-30 cursor-not-allowed line-through"
                            : selectedTime === slot.time
                            ? "text-white border-transparent"
                            : "border-[var(--border)] hover:border-[var(--primary)]"
                        }`}
                        style={
                          selectedTime === slot.time
                            ? { backgroundColor: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }
                            : slot.available
                            ? { color: "var(--ps-text)", backgroundColor: "white" }
                            : { color: "var(--ps-text-mid)", backgroundColor: "var(--ps-lila-pale)" }
                        }
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {/* Hidden input to submit combined datetime */}
                {selectedDate && selectedTime && (
                  <input
                    type="hidden"
                    name="date"
                    value={new Date(`${selectedDate}T${selectedTime}:00`).toISOString()}
                  />
                )}
              </div>
            )}

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                Estado *
              </label>
              <select
                name="status"
                required
                defaultValue="PENDING"
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
                className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !selectedOwner || selectedOwner.dogs.length === 0 || !selectedDate || !selectedTime}
                className="px-6 py-2 rounded-full text-sm font-bold text-white transition-all bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
