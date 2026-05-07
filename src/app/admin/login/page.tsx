import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Petit Salón",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
            className="text-base font-semibold mb-5"
            style={{ color: "var(--ps-text)" }}
          >
            Iniciar sesión
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
