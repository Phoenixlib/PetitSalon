"use client";

import { useState } from "react";

export default function CalComManual() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--ps-lila-pale)" }}
    >
      {/* Header clickeable */}
      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ backgroundColor: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(66,194,237,0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📅</span>
          <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            ¿Cómo vincular un Event Type de Cal.com?
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="var(--primary)"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenido expandible */}
      {open && (
        <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-4 text-sm" style={{ color: "#374151" }}>

            {/* Paso 1 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Paso 1 — Identificar el nombre en Cal.com
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Ve a <strong>app.cal.com → Event Types</strong> y busca el nombre exacto.
                Ej: <code className="rounded px-1 py-0.5 text-[11px] font-mono" style={{ backgroundColor: "var(--pastel-cyan)", color: "var(--foreground)" }}>Baño y Secado Perro Pequeño</code>
              </p>
            </div>

            {/* Paso 3 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Paso 2 — Llenar el campo "Enlace de Cal.com"
              </p>
              <p className="text-xs leading-relaxed text-gray-600 mb-2">
                Tienes dos opciones válidas:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(66,194,237,0.08)", border: "1px solid var(--pastel-cyan)" }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--foreground)" }}>✅ Opción A — Nombre exacto</p>
                  <p className="text-[10px] leading-relaxed text-gray-600 font-mono">
                    Baño y Secado Perro Pequeño
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(66,194,237,0.04)", border: "1px solid var(--border)" }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--foreground)" }}>✅ Opción B — Slug del URL</p>
                  <p className="text-[10px] leading-relaxed text-gray-600 font-mono">
                    petitsalon/bano-y-secado
                  </p>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="rounded-xl px-4 py-3 flex gap-2.5" style={{ backgroundColor: "var(--pastel-yellow)", border: "1px solid #f4cc6a" }}>
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="text-[10px] leading-relaxed" style={{ color: "#6b5c1a" }}>
                Si no se configura, el sistema asignará la cita al <strong>primer servicio activo</strong> por defecto.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
