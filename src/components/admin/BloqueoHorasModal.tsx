"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDateStr: string | null;
  onSuccess: () => void;
}

const GENERATED_TIMES = Array.from({ length: 73 }, (_, i) => {
  const hour = Math.floor(i / 3);
  const minute = (i % 3) * 20;
  if (hour === 24) {
    if (minute > 0) return null;
    return "24:00";
  }
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}).filter(Boolean) as string[];

export default function BloqueoHorasModal({
  isOpen,
  onClose,
  initialDateStr,
  onSuccess,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>("08:00"); // HH:MM
  const [endTime, setEndTime] = useState<string>("09:00"); // HH:MM
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    setIsFullscreen(!!document.fullscreenElement);
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  useEffect(() => {
    if (initialDateStr && isOpen) {
      const datePart = initialDateStr.substring(0, 10);
      setSelectedDate(datePart);

      if (initialDateStr.includes("T")) {
        const timePart = initialDateStr.substring(11, 16);
        const [hrStr, minStr] = timePart.split(":");
        if (hrStr && minStr) {
          const hr = parseInt(hrStr);
          const min = parseInt(minStr);
          const roundedMin = Math.round(min / 20) * 20;
          let finalHr = hr;
          let finalMin = roundedMin;
          if (roundedMin === 60) {
            finalHr += 1;
            finalMin = 0;
          }
          const formatted = `${finalHr.toString().padStart(2, "0")}:${finalMin.toString().padStart(2, "0")}`;
          if (GENERATED_TIMES.includes(formatted)) {
            setSelectedTime(formatted);
            const endHr = finalHr + 1;
            const endFormatted = `${endHr.toString().padStart(2, "0")}:${finalMin.toString().padStart(2, "0")}`;
            if (GENERATED_TIMES.includes(endFormatted)) {
              setEndTime(endFormatted);
            } else {
              setEndTime(GENERATED_TIMES[GENERATED_TIMES.length - 1]!);
            }
          }
        }
      }
      setIsFullDay(false);
    } else if (isOpen) {
      const todayStr = new Date().toISOString().substring(0, 10);
      setSelectedDate(todayStr);
      setSelectedTime("08:00");
      setEndTime("09:00");
      setIsFullDay(false);
      setReason("");
      setErrorMsg(null);
      setWarningMsg(null);
    }
  }, [initialDateStr, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);

    if (!selectedDate) {
      setErrorMsg("Por favor, selecciona una fecha.");
      return;
    }

    let startAt: Date;
    let endAt: Date;

    if (isFullDay) {
      startAt = new Date(`${selectedDate}T00:00:00`);
      endAt = new Date(`${selectedDate}T23:59:59`);
    } else {
      if (!selectedTime || !endTime) {
        setErrorMsg("Por favor, selecciona una hora de inicio y término.");
        return;
      }
      
      if (selectedTime === "24:00") {
        startAt = new Date(`${selectedDate}T23:59:59`);
      } else {
        startAt = new Date(`${selectedDate}T${selectedTime}:00`);
      }

      if (endTime === "24:00") {
        endAt = new Date(`${selectedDate}T23:59:59`);
      } else {
        endAt = new Date(`${selectedDate}T${endTime}:00`);
      }

      if (endAt <= startAt) {
        setErrorMsg("La hora de término debe ser posterior a la hora de inicio.");
        return;
      }
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/admin/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt, endAt, reason: reason.trim() || undefined }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Error al crear bloqueo");
      }

      if (result.warning) {
        setWarningMsg(result.warning);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error al crear el bloqueo.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={`${isFullscreen ? "absolute" : "fixed"} inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300`}>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border-t-[8px] border-[var(--primary)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
          <div>
            <h3 className="text-lg text-[var(--ps-text)] font-bold leading-none">
              Bloquear Horario
            </h3>
            <p className="text-xs text-[var(--ps-text-mid)] font-medium mt-1">
              Sincronizado automáticamente con Cal.com
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-[var(--ps-text-mid)] hover:text-[var(--ps-text)] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 font-body">
          <form id="bloqueo-horas-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ps-text-mid)]">
                Fecha del bloqueo *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[var(--ps-text)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                />
                <CalendarIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ps-text-mid)]">
                Tipo de Bloqueo
              </label>
              <div className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="blockType" 
                      checked={!isFullDay}
                      onChange={() => setIsFullDay(false)}
                      className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[var(--primary)] transition-colors cursor-pointer"
                    />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--primary)] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <span className="text-sm font-bold text-[var(--ps-text)] transition-colors">Por Horas</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="blockType" 
                      checked={isFullDay}
                      onChange={() => setIsFullDay(true)}
                      className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[var(--primary)] transition-colors cursor-pointer"
                    />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--primary)] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <span className="text-sm font-bold text-[var(--ps-text)] transition-colors">Día Completo</span>
                </label>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${isFullDay ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ps-text-mid)]">
                  Hora Inicio *
                </label>
                <div className="relative">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={isFullDay}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[var(--ps-text)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors appearance-none cursor-pointer disabled:bg-gray-50"
                  >
                    {GENERATED_TIMES.filter(t => t !== "24:00").map((time) => (
                      <option key={time} value={time}>
                        {time} hrs
                      </option>
                    ))}
                  </select>
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ps-text-mid)]">
                  Hora Final *
                </label>
                <div className="relative">
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isFullDay}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[var(--ps-text)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors appearance-none cursor-pointer disabled:bg-gray-50"
                  >
                    {GENERATED_TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time} hrs
                      </option>
                    ))}
                  </select>
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ps-text-mid)]">
                Motivo del bloqueo
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Ej. Almuerzo, Reunión, Vacaciones..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[var(--ps-text)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-bold">
                {errorMsg}
              </p>
            )}

            {warningMsg && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 font-medium flex gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span>{warningMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3 flex-shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-[11px] tracking-widest uppercase hover:bg-gray-50 text-[var(--ps-text)] transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="bloqueo-horas-form"
            disabled={isPending}
            className="px-8 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl font-bold text-[11px] tracking-widest uppercase transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? "Bloqueando..." : "Confirmar Bloqueo"}
          </button>
        </div>
      </div>
    </div>
  );
}
