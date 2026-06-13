"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, Clock, Trash2, AlertTriangle } from "lucide-react";

interface BlockedSlot {
  id: string;
  startAt: string | Date;
  endAt: string | Date;
  reason?: string | null;
  calComOverrideId?: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  block: BlockedSlot | null;
  onSuccess: () => void;
}

export default function BlockDetailsModal({ isOpen, onClose, block, onSuccess }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    setIsFullscreen(!!document.fullscreenElement);
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  if (!isOpen || !block) return null;

  const start = new Date(block.startAt);
  const end = new Date(block.endAt);

  const dateStr = start.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const startStr = start.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  const endStr = end.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  const isFullDay =
    start.getHours() === 0 && start.getMinutes() === 0 &&
    end.getHours() === 23 && end.getMinutes() === 59;

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este bloqueo?")) return;

    setIsPending(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/blocked-slots?id=${block.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Error al eliminar el bloqueo");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al eliminar el bloqueo");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={`${isFullscreen ? "absolute" : "fixed"} inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300`}>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border-t-[8px] border-red-500 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-red-50 flex-shrink-0">
          <div className="flex gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl h-fit">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg text-red-900 font-bold leading-none mb-1">
                Horario Bloqueado
              </h3>
              <p className="text-xs text-red-700 font-medium max-w-[200px]">
                {block.calComOverrideId 
                  ? "Este bloqueo está sincronizado con Cal.com" 
                  : "Bloqueo local (No sincronizado / Override fallido)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-full text-red-400 hover:text-red-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 font-body space-y-6">
          
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[var(--ps-text-mid)] mb-1">
                <CalendarIcon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span>
              </div>
              <p className="text-sm font-bold text-[var(--ps-text)] capitalize">
                {dateStr}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-[var(--ps-text-mid)] mb-1">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Horario</span>
              </div>
              <p className="text-sm font-bold text-[var(--ps-text)]">
                {isFullDay ? "Día Completo" : `${startStr} - ${endStr}`}
              </p>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 mb-1 block">Motivo</span>
            <p className="text-sm text-orange-900 font-medium">
              {block.reason || <span className="italic opacity-60">Sin motivo especificado</span>}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3 flex-shrink-0 justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isPending ? "Eliminando..." : "Eliminar Bloqueo"}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-[11px] tracking-widest uppercase bg-gray-100 hover:bg-gray-200 text-[var(--ps-text)] transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
