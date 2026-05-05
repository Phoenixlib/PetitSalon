"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BookingFormData } from "../types";

const schema = z.object({
  ownerName: z.string().min(1, "Nombre requerido").max(100),
  ownerPhone: z.string().min(6, "Teléfono requerido").max(20),
  ownerEmail: z.string().email("Email inválido").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: Partial<BookingFormData>;
  onNext: (
    data: Pick<BookingFormData, "ownerName" | "ownerPhone" | "ownerEmail">,
  ) => void;
}

export default function StepOwner({ data, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: data.ownerName ?? "",
      ownerPhone: data.ownerPhone ?? "",
      ownerEmail: data.ownerEmail ?? "",
    },
  });

  return (
    <form
      id="step-owner-form"
      onSubmit={handleSubmit((values) =>
        onNext({
          ownerName: values.ownerName,
          ownerPhone: values.ownerPhone,
          ownerEmail: values.ownerEmail ?? "",
        }),
      )}
      className="space-y-4"
    >
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Te contactaremos para confirmar la cita.
      </p>

      <Field label="Tu nombre" error={errors.ownerName?.message}>
        <input
          {...register("ownerName")}
          placeholder="Ej: María González"
          className={inputCls(!!errors.ownerName)}
        />
      </Field>

      <Field label="Teléfono / WhatsApp" error={errors.ownerPhone?.message}>
        <input
          {...register("ownerPhone")}
          type="tel"
          placeholder="+56 9 XXXX XXXX"
          className={inputCls(!!errors.ownerPhone)}
        />
      </Field>

      <Field
        label="Correo electrónico (opcional)"
        error={errors.ownerEmail?.message}
      >
        <input
          {...register("ownerEmail")}
          type="email"
          placeholder="tu@email.com"
          className={inputCls(!!errors.ownerEmail)}
        />
      </Field>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--ps-text)" }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",
    "focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-200 focus:border-[var(--ps-lila)] focus:ring-[color:var(--ps-lila-pale)]",
  ].join(" ");
}
