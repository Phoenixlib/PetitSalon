"use client";

import { useState } from "react";
import type { BookingFormData, WorkingHours } from "../types";
import { DEFAULT_WORKING_HOURS } from "../config";

interface Props {
  data: Partial<BookingFormData>;
  workingHours?: WorkingHours;
  onSelect: (data: Pick<BookingFormData, "date">) => void;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DOW = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export default function StepDate({ data, workingHours, onSelect }: Props) {
  const wh = workingHours ?? DEFAULT_WORKING_HOURS;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [cursor, setCursor] = useState(() => {
    const d = data.date ? new Date(data.date + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = cursor;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCursor(({ year: y, month: m }) =>
      m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 },
    );
  }
  function nextMonth() {
    setCursor(({ year: y, month: m }) =>
      m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 },
    );
  }

  function isDisabled(d: number) {
    const date = new Date(year, month, d);
    if (date < today) return true;
    return !wh.days.includes(date.getDay());
  }

  function toISO(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const selected = data.date;

  // Blanks before the 1st (adjust so week starts on Monday)
  const blanks = (firstDay + 6) % 7; // Mon-based

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Elige la fecha de tu cita. Solo se muestran días con atención.
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <span className="font-semibold" style={{ color: "var(--ps-text)" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      {/* Days of week header — Monday first */}
      <div className="grid grid-cols-7 text-center">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
          <div
            key={d}
            className="text-xs font-semibold py-1"
            style={{ color: "var(--ps-text-mid)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const iso = toISO(d);
          const disabled = isDisabled(d);
          const isSelected = selected === iso;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onSelect({ date: iso })}
              className="aspect-square rounded-full text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2"
              style={{
                backgroundColor: isSelected ? "var(--ps-lila)" : "transparent",
                color: disabled
                  ? "#d1d5db"
                  : isSelected
                    ? "white"
                    : "var(--ps-text)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {selected && (
        <p
          className="text-sm text-center font-medium"
          style={{ color: "var(--ps-lila)" }}
        >
          Fecha seleccionada:{" "}
          {new Date(selected + "T00:00:00").toLocaleDateString("es-CL", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      )}
      {/* suppress unused var warning */}
      <span className="hidden">{DOW.join("")}</span>
    </div>
  );
}
