import type { Metadata } from "next";
import RecuperarForm from "@/components/admin/RecuperarForm";
import Link from "next/link";

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
        {/* Back Button */}
        <div className="mb-6 md:block hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-75"
            style={{ color: "var(--ps-lila-deep)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-0.5"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver a la web
          </Link>
        </div>
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
