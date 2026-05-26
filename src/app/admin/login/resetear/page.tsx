import type { Metadata } from "next";
import { Suspense } from "react";
import ResetearForm from "@/components/admin/ResetearForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Petit Salón",
};

export default function ResetearPage() {
  return (
    <div
      className="flex items-center justify-center px-4 py-16 min-h-[calc(100vh-4rem)]"
      style={{ backgroundColor: "var(--ps-lila-base)" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-lila-deep)",
            }}
          >
            Petit Salón
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ps-text-mid)" }}>
            Panel de administración
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: "white",
            border: "1px solid var(--ps-lila-light)",
          }}
        >
          <h2
            className="text-base font-semibold mb-2"
            style={{ color: "var(--ps-text)" }}
          >
            Restablecer contraseña
          </h2>
          <p className="text-xs mb-5" style={{ color: "var(--ps-text-mid)" }}>
            Ingresa tu nueva contraseña para actualizar el acceso al panel.
          </p>
          <Suspense fallback={<div className="text-xs text-center py-4 text-slate-500">Cargando formulario...</div>}>
            <ResetearForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
