"use client";

import type { BookingFormData, BookingService } from "../types";

interface Props {
  services: BookingService[];
  data: Partial<BookingFormData>;
  onSelect: (
    data: Pick<
      BookingFormData,
      "serviceId" | "serviceName" | "servicePrice" | "serviceDuration"
    >,
  ) => void;
}

export default function StepService({ services, data, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
        Elige el servicio que necesita tu mascota.
      </p>
      <div className="grid gap-3">
        {services.map((svc) => {
          const selected = data.serviceId === svc.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() =>
                onSelect({
                  serviceId: svc.id,
                  serviceName: svc.name,
                  servicePrice: svc.price,
                  serviceDuration: svc.duration,
                })
              }
              className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: selected
                  ? "var(--ps-lila)"
                  : "var(--ps-lila-pale)",
                backgroundColor: selected ? "var(--ps-lila-pale)" : "white",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-base"
                    style={{
                      color: selected
                        ? "var(--ps-lila-deep)"
                        : "var(--ps-text)",
                    }}
                  >
                    {svc.name}
                  </p>
                  {svc.description && (
                    <p
                      className="text-sm mt-0.5 truncate"
                      style={{ color: "var(--ps-text-mid)" }}
                    >
                      {svc.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-bold text-lg"
                    style={{ color: "var(--ps-lila)" }}
                  >
                    ${svc.price.toLocaleString("es-CL")}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    ~{svc.duration} min
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
