"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/app/admin/login/resetear/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetearForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
          El enlace de recuperación es inválido o no contiene un token válido.
        </p>
        <Link
          href="/admin/login"
          className="block w-full text-center font-medium py-2.5 rounded-full text-sm border hover:bg-slate-50 transition-colors mt-4 text-slate-700"
          style={{
            borderColor: "var(--border)",
          }}
        >
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p className="text-sm p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          Contraseña restablecida con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.
        </p>
        <Link
          href="/admin/login"
          className="block w-full text-center font-medium py-2.5 rounded-full text-sm border hover:bg-slate-50 transition-colors mt-4 text-slate-700"
          style={{
            borderColor: "var(--border)",
          }}
        >
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden Token input */}
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground"
          style={{ borderColor: "var(--ps-lila-light)" }}
          placeholder="••••••••"
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila-light)";
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground"
          style={{ borderColor: "var(--ps-lila-light)" }}
          placeholder="••••••••"
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila-light)";
          }}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        style={{ backgroundColor: "var(--ps-lila)", color: "white" }}
      >
        {isPending ? "Restableciendo..." : "Restablecer contraseña"}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/admin/login"
          className="text-xs transition-colors hover:underline"
          style={{ color: "var(--ps-text-mid)" }}
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
