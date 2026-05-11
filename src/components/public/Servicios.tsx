"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  calComLink: string | null;
};

type Props = {
  services: Service[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

const SERVICE_ICONS = [
  <svg
    key="scissors"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>,
  <svg
    key="drop"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>,
  <svg
    key="star"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  <svg
    key="paw"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="7" cy="8" r="2" />
    <circle cx="17" cy="8" r="2" />
    <circle cx="4" cy="14" r="2" />
    <circle cx="20" cy="14" r="2" />
    <path d="M12 15c-2 0-5 1.5-5 4.5 0 1.4 1.4 2.5 5 2.5s5-1.1 5-2.5c0-3-3-4.5-5-4.5z" />
  </svg>,
  <svg
    key="heart"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>,
  <svg
    key="zap"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>,
  <svg
    key="clock"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
];

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

export default function Servicios({ services }: Props) {
  const [selected, setSelected] = useState<
    (Service & { index: number }) | null
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

  if (services.length === 0) return null;

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

          {/* Grid de cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {services.map((service, i) => (
              <motion.button
                key={service.id}
                variants={cardAnim}
                onClick={() => setSelected({ ...service, index: i })}
                className="relative rounded-3xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300 text-left w-full cursor-pointer"
                style={{
                  backgroundColor: CARD_COLORS[i % CARD_COLORS.length],
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                {/* Icono */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <div className="w-5 h-5" style={{ color: "var(--ps-text)" }}>
                    {SERVICE_ICONS[i % SERVICE_ICONS.length]}
                  </div>
                </div>

                {/* Nombre y descripción */}
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
                      style={{ color: "var(--ps-text-mid)" }}
                    >
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Footer card */}
                <div className="mt-auto flex items-end justify-between pt-2">
                  <div>
                    <p
                      className="text-xl font-bold"
                      style={{ color: "var(--ps-text)" }}
                    >
                      {formatPrice(service.price)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--ps-text-mid)" }}
                    >
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
            ))}
          </motion.div>

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
                    {SERVICE_ICONS[selected.index % SERVICE_ICONS.length]}
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
                    style={{ color: "var(--ps-text-mid)" }}
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
