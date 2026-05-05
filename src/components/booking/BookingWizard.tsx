"use client";

import { useState, useRef } from "react";
import type {
  BookingFormData,
  BookingService,
  WizardStep,
  WorkingHours,
} from "./types";
import { STEPS_LABELS, WIZARD_STEPS } from "./config";
import StepService from "./steps/StepService";
import StepDate from "./steps/StepDate";
import StepTime from "./steps/StepTime";
import StepPet from "./steps/StepPet";
import StepOwner from "./steps/StepOwner";
import StepSummary from "./steps/StepSummary";
import BookingSuccess from "./BookingSuccess";

// ─────────────────────────────────────────────────────────────────────────────
// Props — diseñadas para que el componente sea reutilizable en otros proyectos
// ─────────────────────────────────────────────────────────────────────────────
export interface BookingWizardProps {
  services: BookingService[];
  workingHours?: WorkingHours;
  whatsappNumber?: string;
  title?: string;
  subtitle?: string;
}

const FORM_IDS: Partial<Record<WizardStep, string>> = {
  pet: "step-pet-form",
  owner: "step-owner-form",
};

export default function BookingWizard({
  services,
  workingHours,
  whatsappNumber,
  title = "Reserva tu cita",
  subtitle = "Agenda en minutos, sin complicaciones.",
}: BookingWizardProps) {
  const [step, setStep] = useState<WizardStep>("service");
  const [data, setData] = useState<Partial<BookingFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stepIndex = WIZARD_STEPS.indexOf(step);
  const totalSteps = WIZARD_STEPS.length;
  const progress = (stepIndex / (totalSteps - 1)) * 100;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function merge(patch: Partial<BookingFormData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case "service":
        return !!data.serviceId;
      case "date":
        return !!data.date;
      case "time":
        return !!data.time;
      default:
        return true;
    }
  }

  function advance() {
    const next = WIZARD_STEPS[stepIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    const prev = WIZARD_STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  // For steps with react-hook-form, trigger their form's submit button
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  function handleNextClick() {
    const formId = FORM_IDS[step];
    if (formId) {
      // Submit the inner form → its onSubmit will call onNext → advance()
      const form = document.getElementById(formId) as HTMLFormElement | null;
      form?.requestSubmit();
      return;
    }
    if (step === "summary") {
      void handleSubmit();
      return;
    }
    advance();
  }

  // ── Final submit ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Error al crear la cita");
      }
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (success) {
    return (
      <BookingSuccess
        ownerName={data.ownerName ?? ""}
        dogName={data.dogName ?? ""}
        date={data.date ?? ""}
        time={data.time ?? ""}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  // ── Wizard UI ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-light"
          style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
        >
          {title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ps-text-mid)" }}>
          {subtitle}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6 space-y-2">
        <div
          className="flex justify-between text-xs font-medium"
          style={{ color: "var(--ps-text-mid)" }}
        >
          <span>
            Paso {stepIndex + 1} de {totalSteps}
          </span>
          <span style={{ color: "var(--ps-lila)" }}>{STEPS_LABELS[step]}</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "var(--ps-lila)" }}
          />
        </div>
      </div>

      {/* Step breadcrumb pills */}
      <div className="flex gap-1 mb-6 justify-center flex-wrap">
        {WIZARD_STEPS.map((s, i) => (
          <div
            key={s}
            className="text-[10px] px-2 py-0.5 rounded-full font-medium transition-all"
            style={{
              backgroundColor:
                i <= stepIndex ? "var(--ps-lila)" : "var(--ps-lila-pale)",
              color: i <= stepIndex ? "white" : "var(--ps-text-mid)",
            }}
          >
            {STEPS_LABELS[s]}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className="rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "var(--ps-lila-pale)",
          backgroundColor: "white",
        }}
      >
        {step === "service" && (
          <StepService
            services={services}
            data={data}
            onSelect={(patch) => {
              merge(patch);
            }}
          />
        )}
        {step === "date" && (
          <StepDate
            data={data}
            workingHours={workingHours}
            onSelect={(patch) => {
              merge(patch);
              merge({ time: undefined });
            }}
          />
        )}
        {step === "time" && (
          <StepTime
            data={data}
            onSelect={(patch) => {
              merge(patch);
            }}
          />
        )}
        {step === "pet" && (
          <StepPet
            data={data}
            onNext={(patch) => {
              merge(patch);
              advance();
            }}
          />
        )}
        {step === "owner" && (
          <StepOwner
            data={data}
            onNext={(patch) => {
              merge(patch);
              advance();
            }}
          />
        )}
        {step === "summary" && <StepSummary data={data as BookingFormData} />}

        {/* Error message */}
        {submitError && (
          <p className="mt-4 text-sm text-red-500 text-center">{submitError}</p>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-4">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="flex-1 py-3 rounded-full border font-semibold text-sm transition hover:bg-gray-50"
            style={{
              borderColor: "var(--ps-lila-pale)",
              color: "var(--ps-text-mid)",
            }}
          >
            ← Atrás
          </button>
        )}

        <button
          ref={nextBtnRef}
          type="button"
          onClick={handleNextClick}
          disabled={!canAdvance() || submitting}
          className="flex-[2] py-3 rounded-full font-semibold text-sm text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--ps-lila)" }}
        >
          {submitting
            ? "Enviando…"
            : step === "summary"
              ? "Confirmar cita"
              : "Siguiente →"}
        </button>
      </div>
    </div>
  );
}
