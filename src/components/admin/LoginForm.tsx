"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, null);

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

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors"
          style={{ borderColor: "var(--ps-lila-light)" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--ps-lila-light)";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        style={{ backgroundColor: "var(--ps-lila)", color: "white" }}
      >
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
