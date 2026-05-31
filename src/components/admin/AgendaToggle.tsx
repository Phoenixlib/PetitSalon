"use client";

import { useState, useTransition } from "react";
import { toggleAgendaBloqueadaAction } from "@/app/admin/configuracion/actions";

interface Props {
  initialValue: boolean;
}

export default function AgendaToggle({ initialValue }: Props) {
  const [bloqueada, setBloqueada] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newValue = !bloqueada;
    setBloqueada(newValue); // optimista
    startTransition(async () => {
      const result = await toggleAgendaBloqueadaAction(newValue);
      if (!result.success) {
        setBloqueada(!newValue); // revertir si falla
      }
    });
  }

  return (
    <div className="rounded-xl overflow-hidden max-w-2xl" style={{ border: "1px solid var(--ps-lila-light)" }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--ps-lila-light)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--ps-text)" }}>
          Agenda de reservas pública
        </h2>
      </div>
      <div className="p-4 md:p-6 bg-white flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
            {bloqueada ? "🔒 Agenda bloqueada" : "✅ Agenda activa"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--ps-text-mid)" }}>
            {bloqueada
              ? "Los clientes ven un mensaje de agenda cerrada al intentar reservar."
              : "Los clientes pueden agendar normalmente desde el sitio web."}
          </p>
        </div>
        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={bloqueada}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          style={{
            backgroundColor: bloqueada ? "var(--secondary)" : "var(--primary)",
            borderColor: "transparent",
          }}
        >
          <span
            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            style={{ transform: bloqueada ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>
    </div>
  );
}
