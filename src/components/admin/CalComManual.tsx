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
                Paso 1 — Ir a Cal.com
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Haz clic en el link <strong style={{ color: "var(--ps-gold)" }}>↗ Ver Event Types</strong> del modal para ir directo a tus eventos en Cal.com.
              </p>
            </div>

            {/* Paso 2 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Paso 2 — Duplicar un evento existente
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Para mantener la configuración de preguntas al cliente, haz clic en los <strong>3 puntos</strong> de cualquier evento y selecciona <strong>"Duplicar"</strong>.
              </p>
            </div>

            {/* Paso 3 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Paso 3 — Configurar el nuevo servicio
              </p>
              <ul className="text-xs leading-relaxed text-gray-600 list-disc ml-4 space-y-1">
                <li>Ponle el <strong>mismo nombre</strong> que tendrá en esta app.</li>
                <li>La URL se generará automáticamente.</li>
                <li>Elige la <strong>duración</strong> correcta para la agenda.</li>
                <li>Presiona <strong>Continuar</strong>.</li>
              </ul>
            </div>

            {/* Paso 4 */}
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Paso 4 — Copiar y Vincular
              </p>
              <p className="text-xs leading-relaxed text-gray-600">
                Copia la <strong>URL (link)</strong> obtenida, vuelve aquí y pégala en el campo <strong>"Enlace de Cal.com"</strong>. Luego presiona <strong>Guardar cambios</strong>. Ya puedes cerrar la ventana de Cal.com.
              </p>
            </div>

            {/* Advertencia */}
            <div className="rounded-xl px-4 py-3 flex gap-2.5" style={{ backgroundColor: "var(--pastel-yellow)", border: "1px solid #f4cc6a" }}>
              <span className="text-base flex-shrink-0">💡</span>
              <p className="text-[10px] leading-relaxed" style={{ color: "#6b5c1a" }}>
                Al duplicar te aseguras de que el cliente complete todos los datos necesarios (nombre del perro, raza, etc.) ya configurados en Cal.com.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
