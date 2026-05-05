"use client";

import { motion } from "framer-motion";
import { Droplets, Scissors, Sparkles } from "lucide-react";

const SERVICIOS = [
  {
    icon: Droplets,
    nombre: "Baño y Secado",
    descripcion:
      "Limpieza profunda con productos especializados, seguido de un secado profesional que deja el pelaje suave, brillante y con aroma agradable.",
  },
  {
    icon: Scissors,
    nombre: "Corte",
    descripcion:
      "Corte personalizado según la raza y preferencias del dueño. Estilizado que resalta la belleza natural de tu compañero.",
  },
  {
    icon: Sparkles,
    nombre: "Corte de Uñas",
    descripcion:
      "Lima y corte preciso para mantener el bienestar y la comodidad de tu mascota al caminar, evitando lesiones y molestias.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: i * 0.12,
    },
  }),
};

export default function Servicios() {
  return (
    <section
      id="servicios"
      className="py-28 lg:py-36"
      style={{ backgroundColor: "white" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--ps-gold)" }}
          >
            ✦ Lo que ofrecemos
          </span>
          <h2
            className="mt-3 font-light leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              color: "var(--ps-text)",
            }}
          >
            Nuestros{" "}
            <em
              className="italic font-medium"
              style={{ color: "var(--ps-lila)" }}
            >
              servicios
            </em>
          </h2>
          <div
            className="mt-5 w-12 h-px"
            style={{ backgroundColor: "var(--ps-gold)" }}
          />
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {SERVICIOS.map((servicio, i) => {
            const Icon = servicio.icon;
            return (
              <motion.div
                key={servicio.nombre}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative flex flex-col gap-5 p-8 rounded-3xl cursor-default"
                style={{
                  backgroundColor: "var(--ps-lila-base)",
                  border: "1px solid var(--ps-lila-pale)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: "var(--ps-lila-pale)" }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--ps-lila)" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-2xl font-light"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ps-text)",
                    }}
                  >
                    {servicio.nombre}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    {servicio.descripcion}
                  </p>
                </div>

                {/* Gold accent line at bottom */}
                <div
                  className="absolute bottom-0 left-8 h-px w-0 group-hover:w-1/2 transition-all duration-500"
                  style={{ backgroundColor: "var(--ps-gold)" }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* CTA below cards */}
        <motion.p
          className="mt-12 text-center text-sm"
          style={{ color: "var(--ps-text-mid)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          ¿Tienes dudas sobre precios o disponibilidad?{" "}
          <a
            href="https://wa.me/59675707476"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--ps-gold)" }}
          >
            Consúltanos por WhatsApp
          </a>
        </motion.p>
      </div>
    </section>
  );
}
