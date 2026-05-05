"use client";

import type { BookingFormData } from "../types";
import { DOG_SIZE_LABELS } from "../config";

interface Props {
  data: BookingFormData;
}

export default function StepSummary({ data }: Props) {
  const dateLabel = new Date(data.date + "T00:00:00").toLocaleDateString(
    "es-CL",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const rows: [string, string][] = [
    ["Servicio", data.serviceName],
    ["Precio", `$${data.servicePrice.toLocaleString("es-CL")} CLP`],
    ["Fecha", dateLabel],
    ["Hora", data.time],
    [
      "Perro",
      `${data.dogName} — ${data.dogBreed} (${DOG_SIZE_LABELS[data.dogSize] ?? data.dogSize})`,
    ],
    ["Dueño", data.ownerName],
    ["Teléfono", data.ownerPhone],
    ...(data.ownerEmail
      ? [["Email", data.ownerEmail] as [string, string]]
      : []),
    ...(data.dogNotes ? [["Notas", data.dogNotes] as [string, string]] : []),
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Revisa los datos antes de confirmar tu cita.
      </p>

      <div
        className="rounded-2xl border overflow-hidden divide-y"
        style={
          {
            borderColor: "var(--ps-lila-pale)",
            "--tw-divide-opacity": "1",
          } as React.CSSProperties
        }
      >
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start gap-4 px-4 py-3">
            <span
              className="text-xs font-semibold uppercase tracking-wide w-24 shrink-0 pt-0.5"
              style={{ color: "var(--ps-text-mid)" }}
            >
              {label}
            </span>
            <span
              className="text-sm font-medium flex-1 capitalize"
              style={{ color: "var(--ps-text)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <p
        className="text-xs text-center"
        style={{ color: "var(--ps-text-mid)" }}
      >
        La cita quedará <strong>pendiente de confirmación</strong>. Te
        contactaremos por WhatsApp para confirmar.
      </p>
    </div>
  );
}
