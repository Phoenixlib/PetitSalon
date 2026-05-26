"use client";

import { useActionState } from "react";
import { requestResetAction } from "@/app/admin/login/recuperar/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RecuperarForm() {
  const [state, formAction, isPending] = useActionState(requestResetAction, null);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <p className="text-sm p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          Si el correo está registrado, recibirás un enlace de recuperación en los próximos minutos.
        </p>
        <Link
          href="/admin/login"
          className="block w-full text-center font-medium py-2.5 rounded-full text-sm border hover:bg-slate-50 transition-colors mt-4 text-slate-700"
          style={{
            borderColor: "var(--border)",
          }}
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground"
          style={{ borderColor: "var(--ps-lila-light)" }}
          placeholder="hola@petitsalon.cl"
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
        {isPending ? "Enviando enlace…" : "Enviar enlace de recuperación"}
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
