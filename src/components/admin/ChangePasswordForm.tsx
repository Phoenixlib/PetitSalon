"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "@/app/admin/configuracion/actions";
import { Button } from "@/components/ui/button";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Limpiar el formulario cuando tiene éxito
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
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
          htmlFor="newPassword"
          className="block text-sm font-medium"
          style={{ color: "var(--ps-text)" }}
        >
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          name="newPassword"
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
          Confirmar nueva contraseña
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
        <p role="alert" className="text-sm text-destructive font-medium">
          {state.error}
        </p>
      )}

      {state?.success && state.successMessage && (
        <p className="text-sm text-emerald-600 font-medium">
          {state.successMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2"
        style={{ backgroundColor: "var(--ps-lila)", color: "white" }}
      >
        {isPending ? "Guardando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
