"use client";

import { useEffect, useState } from "react";
import type { BookingFormData } from "../types";

interface Props {
  data: Partial<BookingFormData>;
  onSelect: (data: Pick<BookingFormData, "time">) => void;
}

export default function StepTime({ data, onSelect }: Props) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data.date) return;
    setLoading(true);
    setError(null);
    fetch(`/api/appointments/available?date=${data.date}`)
      .then((r) => r.json())
      .then((json: { slots?: string[]; error?: string }) => {
        if (json.error) throw new Error(json.error);
        setSlots(json.slots ?? []);
      })
      .catch(() =>
        setError("No se pudieron cargar los horarios. Intenta de nuevo."),
      )
      .finally(() => setLoading(false));
  }, [data.date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor:
              "var(--ps-lila) transparent var(--ps-lila) var(--ps-lila)",
          }}
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm text-center py-8">{error}</p>;
  }

  if (slots.length === 0) {
    return (
      <p
        className="text-center py-8 text-sm"
        style={{ color: "var(--ps-text-mid)" }}
      >
        No hay horarios disponibles para esta fecha. Elige otro día.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Selecciona el horario que más te acomode.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const selected = data.time === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect({ time: slot })}
              className="py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: selected
                  ? "var(--ps-lila)"
                  : "var(--ps-lila-pale)",
                backgroundColor: selected ? "var(--ps-lila)" : "white",
                color: selected ? "white" : "var(--ps-text)",
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
