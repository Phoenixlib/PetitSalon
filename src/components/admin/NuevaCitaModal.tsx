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
  availabilityRules?: any[];
}

export default function NuevaCitaModal({
  isOpen,
  onClose,
  initialDateStr,
  services,
  onSuccess,
  availabilityRules = [],
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newDogName, setNewDogName] = useState("");
  const [newDogBreed, setNewDogBreed] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>("");  // "YYYY-MM-DD"
  const [selectedTime, setSelectedTime] = useState<string>("");  // "HH:MM"
  const [allowOverbooking, setAllowOverbooking] = useState(false);
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
      if (state.waLink) {
        try {
          window.open(state.waLink, "_blank");
        } catch (e) {
          console.error("Error opening waLink", e);
        }
      }
      onSuccess();
      onClose();
    }
  }, [state?.success, state?.waLink, onSuccess, onClose]);

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

  // Fetch day appointments and blocked slots to check for clashes
  const [dayAppointments, setDayAppointments] = useState<any[]>([]);
  const [dayBlocks, setDayBlocks] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedDate || !isOpen) {
      setDayAppointments([]);
      setDayBlocks([]);
      return;
    }

    const startOfSelectedDay = new Date(`${selectedDate}T00:00:00`);
    const startObj = new Date(startOfSelectedDay.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const endObj = new Date(startOfSelectedDay.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const fetchAppts = fetch(`/api/admin/appointments?from=${startObj}&to=${endObj}`).then(res => res.json());
    const fetchBlocks = fetch(`/api/admin/blocked-slots?from=${startObj}&to=${endObj}`).then(res => res.json());

    Promise.all([fetchAppts, fetchBlocks]).then(([appts, blocks]) => {
      setDayAppointments(Array.isArray(appts) ? appts : []);
      setDayBlocks(Array.isArray(blocks) ? blocks : []);
    }).catch(err => {
      console.error("Error fetching clash data", err);
    });
  }, [selectedDate, isOpen]);

  // Check clashes and availability
  let hasClash = false;
  let isOutsideAvailability = false;
  const selectedService = services.find((s) => s.id === selectedServiceId);

  if (selectedDate && selectedTime && selectedService) {
    const newStart = new Date(`${selectedDate}T${selectedTime}:00`);
    const newEnd = new Date(newStart.getTime() + selectedService.duration * 60000);

    const hasApptClash = dayAppointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(apptStart.getTime() + appt.service.duration * 60000);
      return newStart < apptEnd && newEnd > apptStart && appt.status !== "CANCELLED";
    });

    const hasBlockClash = dayBlocks.some((block) => {
      const blockStart = new Date(block.startAt);
      const blockEnd = new Date(block.endAt);
      return newStart < blockEnd && newEnd > blockStart;
    });

    hasClash = hasApptClash || hasBlockClash;

    if (availabilityRules && availabilityRules.length > 0) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = dayNames[newStart.getDay()];
      
      const rules = availabilityRules.filter(r => r.days.includes(dayOfWeek));
      if (rules.length === 0) {
        isOutsideAvailability = true; // Closed day
      } else {
        const timeToMins = (timeStr: string, isEnd = false) => {
          if (isEnd && timeStr === "00:00") return 24 * 60;
          const [h, m] = timeStr.split(":").map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        };
        const startMins = newStart.getHours() * 60 + newStart.getMinutes();
        const endMins = startMins + selectedService.duration;

        const fits = rules.some(r => {
          const ruleStartMins = timeToMins(r.startTime);
          const ruleEndMins = timeToMins(r.endTime, true);
          return startMins >= ruleStartMins && endMins <= ruleEndMins;
        });
        isOutsideAvailability = !fits;
      }
    }
  }

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
        <form action={formAction} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Step 1: Owner Search & Select */}
          <div className="space-y-4">
            {!selectedOwner ? (
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                    Cliente *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingOwner(!isCreatingOwner)}
                    className="text-xs font-bold underline hover:opacity-85 cursor-pointer"
                    style={{ color: "var(--primary)" }}
                  >
                    {isCreatingOwner ? "Buscar cliente existente" : "+ Agregar cliente y mascota"}
                  </button>
                </div>
                
                {isCreatingOwner ? (
                  <div className="p-4 rounded-xl border space-y-4" style={{ borderColor: "var(--primary)", backgroundColor: "var(--ps-lila-pale)" }}>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-teal/70" style={{ color: "var(--ps-text-mid)" }}>Datos del Cliente</label>
                       <div className="grid grid-cols-2 gap-3">
                         <input type="text" name="newOwnerName" required value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} placeholder="Nombre del dueño" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }} />
                         <input type="text" name="newOwnerPhone" required value={newOwnerPhone} onChange={(e) => setNewOwnerPhone(e.target.value)} placeholder="Teléfono (+569...)" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }} />
                       </div>
                       <input type="email" name="newOwnerEmail" value={newOwnerEmail} onChange={(e) => setNewOwnerEmail(e.target.value)} placeholder="Email (opcional)" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-teal/70" style={{ color: "var(--ps-text-mid)" }}>Datos de la Mascota</label>
                       <div className="grid grid-cols-2 gap-3">
                         <input type="text" name="newDogName" required value={newDogName} onChange={(e) => setNewDogName(e.target.value)} placeholder="Nombre" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }} />
                         <input type="text" name="newDogBreed" required value={newDogBreed} onChange={(e) => setNewDogBreed(e.target.value)} placeholder="Raza" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }} />
                       </div>
                    </div>
                    <input type="hidden" name="dogId" value="new" />
                  </div>
                ) : (
                  <>
                  <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Busca por nombre del dueño o mascota..."
                    className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
                  />
                  {loadingSearch && (
                    <p className="text-[10px] absolute right-3 top-3 animate-pulse" style={{ color: "var(--ps-text-mid)" }}>
                      Buscando...
                    </p>
                  )}
                  {searchQuery && !loadingSearch && owners.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 border rounded-xl bg-white shadow-xl p-4 text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--ps-text-mid)" }}>
                      No se encontraron clientes.
                    </div>
                  )}
                  {owners.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border rounded-xl max-h-48 overflow-y-auto divide-y bg-white shadow-xl" style={{ borderColor: "var(--border)" }}>
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
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm transition-colors flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <p className="font-bold" style={{ color: "var(--ps-text)" }}>
                              {owner.name}
                            </p>
                            <p className="text-[11px] font-medium" style={{ color: "var(--ps-text-mid)" }}>
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
                  </>
                )}
                </div>
            ) : (
              <div
                className="p-3 rounded-xl border flex items-center justify-between"
                style={{ borderColor: "var(--primary)", backgroundColor: "var(--ps-lila-pale)" }}
              >
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--ps-text)" }}>
                    {selectedOwner.name}
                  </p>
                  <p className="text-[11px] font-medium" style={{ color: "var(--ps-text-mid)" }}>
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
                  className="text-xs font-bold underline hover:opacity-85 cursor-pointer"
                  style={{ color: "var(--primary)" }}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Form fields container */}
          <div className="space-y-4">
            {/* Hidden Input for Dog ID si no estamos creando */}
            {!isCreatingOwner && <input type="hidden" name="dogId" value={selectedDogId} />}

            {/* Fecha y Hora en una fila */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                  Fecha *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
                />
                {state.errors?.date && <p className="text-xs text-red-500">{state.errors.date[0]}</p>}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                  Hora *
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
                />
                {/* Hidden input to submit combined datetime */}
                {selectedDate && selectedTime && (
                  <input type="hidden" name="date" value={`${selectedDate}T${selectedTime}:00`} />
                )}
              </div>
            </div>

            {(hasClash || isOutsideAvailability) && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-sm font-bold">
                    {hasClash 
                      ? "El horario seleccionado está ocupado por otra cita o bloqueo." 
                      : "El horario seleccionado está fuera del horario habilitado de atención."}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer ml-7 text-amber-900">
                  <input
                    type="checkbox"
                    checked={allowOverbooking}
                    onChange={(e) => setAllowOverbooking(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  Habilitar sobrecupo (ignorar advertencia)
                </label>
                <input type="hidden" name="allowOverbooking" value={allowOverbooking ? "true" : "false"} />
              </div>
            )}

            {/* Select Mascota */}
            {!isCreatingOwner && selectedOwner && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
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
                    className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                Servicio *
              </label>
              <select
                name="serviceId"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
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


            {/* Estado */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                Estado Inicial *
              </label>
              <select
                name="status"
                required
                defaultValue="PENDING"
                className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
              </select>
              {state.errors?.status && <p className="text-xs text-red-500">{state.errors.status[0]}</p>}
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ps-text-mid)" }}>
                Notas de la cita
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Detalles sobre el corte, temperamento, etc..."
                className="w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors resize-none"
                style={{ borderColor: "var(--border)", color: "var(--ps-text)", outlineColor: "var(--primary)" }}
              />
              {state.errors?.notes && <p className="text-xs text-red-500">{state.errors.notes[0]}</p>}
            </div>

            {state.errors?._form && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium border border-red-100">
                {state.errors._form[0]}
              </p>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors cursor-pointer"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || (!isCreatingOwner && (!selectedOwner || selectedOwner.dogs.length === 0)) || !selectedDate || !selectedTime || ((hasClash || isOutsideAvailability) && !allowOverbooking)}
                className="px-8 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {pending ? "Guardando..." : "Guardar Reserva"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
