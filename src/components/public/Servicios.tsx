"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

type ServiceItem = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  calComLink: string | null;
};

type CategoryWithServices = {
  id: string;
  name: string;
  description: string | null;
  services: ServiceItem[];
};

type Props = {
  categories: CategoryWithServices[];
  uncategorizedServices: ServiceItem[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

const PAW_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Dedos superiores */}
    <ellipse cx="7" cy="7.5" rx="2" ry="2.5" />
    <ellipse cx="12" cy="5.5" rx="2" ry="2.5" />
    <ellipse cx="17" cy="7.5" rx="2" ry="2.5" />
    {/* Dedo pulgar lateral */}
    <ellipse cx="4" cy="12" rx="1.5" ry="2" />
    {/* Almohadilla central */}
    <path d="M12 10.5c-3.5 0-6 2-6 5.5 0 2 1.5 4 6 4s6-2 6-4c0-3.5-2.5-5.5-6-5.5z" />
  </svg>
);

const CARD_COLORS = [
  "var(--pastel-cyan)",
  "var(--pastel-pink)",
  "var(--pastel-yellow)",
  "var(--pastel-peach)",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] as const },
  },
};

export default function Servicios({
  categories,
  uncategorizedServices,
}: Props) {
  const [selected, setSelected] = useState<
    (ServiceItem & { index: number }) | null
  >(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const hasAnyService =
    categories.some((c) => c.services.length > 0) ||
    uncategorizedServices.length > 0;
  if (!hasAnyService) return null;

  return (
    <>
      <section
        id="servicios"
        className="py-24 px-4 relative overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Blobs decorativos */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ backgroundColor: "var(--pastel-cyan)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ backgroundColor: "var(--pastel-pink)" }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Encabezado */}
          <div className="text-center mb-16">
            <span
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--ps-gold)" }}
            >
              Nuestra Especialidad
            </span>
            <h2
              className="text-4xl md:text-5xl font-light mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ps-text)",
              }}
            >
              Servicios
            </h2>
            <p
              className="text-lg max-w-md mx-auto"
              style={{ color: "var(--ps-text-mid)" }}
            >
              Todo lo que tu peludo necesita, con el amor que se merece.
            </p>
          </div>

          <div className="space-y-16">
            {categories.map((category) => {
              if (category.services.length === 0) return null;
              return (
                <div
                  key={category.id}
                  className="rounded-3xl p-7 md:p-10"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(182, 230, 230, 0.35)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="mb-6">
                    <h3
                      className="text-2xl font-semibold mb-2"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {category.name}
                    </h3>
                    {category.description && (
                      <p
                        className="text-sm"
                        style={{ color: "var(--ps-text-mid)", whiteSpace: "pre-line" }}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {category.services.map((service, i) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        index={i}
                        onClick={() => setSelected({ ...service, index: i })}
                      />
                    ))}
                  </motion.div>
                </div>
              );
            })}

            {uncategorizedServices.length > 0 && (
              <div>
                <div className="mb-6">
                  <h3
                    className="text-2xl font-semibold mb-2"
                    style={{ color: "var(--ps-text)" }}
                  >
                    Otros Servicios
                  </h3>
                </div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                >
                  {uncategorizedServices.map((service, i) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={i}
                      onClick={() => setSelected({ ...service, index: i })}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Reservar mi cita
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de servicio */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setSelected(null)}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor:
                  CARD_COLORS[selected.index % CARD_COLORS.length],
              }}
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold z-10 transition-opacity hover:opacity-70"
                style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  color: "var(--ps-text)",
                }}
                aria-label="Cerrar"
              >
                ×
              </button>

              <div className="p-8 flex flex-col gap-5">
                {/* Icono grande */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <div className="w-7 h-7" style={{ color: "var(--ps-text)" }}>
                    {PAW_ICON}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <h3
                    className="text-2xl font-semibold leading-tight"
                    style={{ color: "var(--ps-text)" }}
                  >
                    {selected.name}
                  </h3>
                </div>

                {/* Descripción */}
                {selected.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--ps-text-mid)", whiteSpace: "pre-line" }}
                  >
                    {selected.description}
                  </p>
                )}

                {/* Precio + duración */}
                <div
                  className="flex gap-4 rounded-2xl p-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                >
                  <div className="flex-1 text-center">
                    <p
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ color: "var(--ps-text-mid)" }}
                    >
                      Precio
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {formatPrice(selected.price)}
                    </p>
                  </div>
                  <div
                    className="w-px"
                    style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                  />
                  <div className="flex-1 text-center">
                    <p
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ color: "var(--ps-text-mid)" }}
                    >
                      Duración
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {selected.duration}
                      <span className="text-sm font-normal ml-1">min</span>
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/reservar?link=${selected.calComLink || "petitsalon"}&servicio=${encodeURIComponent(selected.name)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:scale-[1.02] mt-1"
                  style={{ backgroundColor: "var(--primary)" }}
                  onClick={() => setSelected(null)}
                >
                  Reservar este servicio
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ServiceCard({
  service,
  index,
  onClick,
}: {
  service: ServiceItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={cardAnim}
      onClick={onClick}
      className="relative rounded-3xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300 text-left w-full cursor-pointer"
      style={{
        backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
      >
        <div className="w-5 h-5" style={{ color: "var(--ps-text)" }}>
          {PAW_ICON}
        </div>
      </div>
      <div>
        <h3
          className="text-base font-semibold leading-snug"
          style={{ color: "var(--ps-text)" }}
        >
          {service.name}
        </h3>
        {service.description && (
          <p
            className="text-sm mt-1 leading-relaxed line-clamp-2"
            style={{ color: "var(--ps-text-mid)", whiteSpace: "pre-line" }}
          >
            {service.description}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between pt-2">
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
            {formatPrice(service.price)}
          </p>
          <p className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
            {service.duration} min
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            color: "var(--primary)",
          }}
        >
          →
        </div>
      </div>
    </motion.button>
  );
}
