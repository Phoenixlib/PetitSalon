import type { Metadata } from "next";
import RecuperarForm from "@/components/admin/RecuperarForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Petit Salón",
};

export default function RecuperarPage() {
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
            Recuperar contraseña
          </h2>
          <p className="text-xs mb-5" style={{ color: "var(--ps-text-mid)" }}>
            Ingresa tu correo electrónico registrado para recibir un enlace de recuperación.
          </p>
          <RecuperarForm />
        </div>
      </div>
    </div>
  );
}
