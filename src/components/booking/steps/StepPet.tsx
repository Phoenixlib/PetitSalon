"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BookingFormData, DogSize } from "../types";
import { DOG_SIZE_LABELS } from "../config";

const schema = z.object({
  dogName: z.string().min(1, "Nombre requerido").max(60),
  dogBreed: z.string().min(1, "Raza requerida").max(80),
  dogSize: z.enum(["XS", "S", "M", "L", "XL"] as const),
  dogNotes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: Partial<BookingFormData>;
  onNext: (
    data: Pick<
      BookingFormData,
      "dogName" | "dogBreed" | "dogSize" | "dogNotes"
    >,
  ) => void;
}

export default function StepPet({ data, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dogName: data.dogName ?? "",
      dogBreed: data.dogBreed ?? "",
      dogSize: (data.dogSize as DogSize) ?? "S",
      dogNotes: data.dogNotes ?? "",
    },
  });

  return (
    <form
      id="step-pet-form"
      onSubmit={handleSubmit((values) =>
        onNext({
          dogName: values.dogName,
          dogBreed: values.dogBreed,
          dogSize: values.dogSize,
          dogNotes: values.dogNotes ?? "",
        }),
      )}
      className="space-y-4"
    >
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Cuéntanos sobre tu mascota para preparar el servicio.
      </p>

      <Field label="Nombre del perro" error={errors.dogName?.message}>
        <input
          {...register("dogName")}
          placeholder="Ej: Max"
          className={inputCls(!!errors.dogName)}
        />
      </Field>

      <Field label="Raza" error={errors.dogBreed?.message}>
        <input
          {...register("dogBreed")}
          placeholder="Ej: Golden Retriever"
          className={inputCls(!!errors.dogBreed)}
        />
      </Field>

      <Field label="Talla aproximada" error={errors.dogSize?.message}>
        <select {...register("dogSize")} className={inputCls(!!errors.dogSize)}>
          {(Object.entries(DOG_SIZE_LABELS) as [DogSize, string][]).map(
            ([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ),
          )}
        </select>
      </Field>

      <Field label="Observaciones (opcional)" error={errors.dogNotes?.message}>
        <textarea
          {...register("dogNotes")}
          rows={3}
          placeholder="Alergias, comportamiento, algo que debamos saber..."
          className={inputCls(!!errors.dogNotes)}
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
