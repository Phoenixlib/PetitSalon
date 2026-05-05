"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    pregunta: "¿Con cuánta anticipación debo reservar?",
    respuesta:
      "Recomendamos reservar con al menos 2 días de anticipación, especialmente en fines de semana. Para turnos de urgencia, contáctanos por WhatsApp y verificamos disponibilidad.",
  },
  {
    pregunta: "¿Qué razas y tamaños aceptan?",
    respuesta:
      "Trabajamos con todas las razas y tamaños, desde pequeños como Chihuahuas hasta grandes como Golden Retrievers. Cada perro recibe atención personalizada según sus necesidades.",
  },
  {
    pregunta: "¿Cuánto tiempo dura la sesión?",
    respuesta:
      "Depende del servicio y tamaño del perro. Un baño y secado para un perro pequeño toma entre 1 y 1.5 horas. Un corte completo para razas grandes puede llevar hasta 3 horas.",
  },
  {
    pregunta: "¿Qué productos usan?",
    respuesta:
      "Utilizamos shampoos y acondicionadores dermatológicos, libres de parabenos y sulfatos, aptos para piel sensible. Si tu perro tiene alguna alergia específica, avísanos al reservar.",
  },
  {
    pregunta: "¿Puedo acompañar a mi mascota durante el servicio?",
    respuesta:
      "En general pedimos que el dueño espere fuera para que el perro no se distraiga y el proceso sea más rápido y seguro. ¡Te avisamos cuando esté listo!",
  },
  {
    pregunta: "¿Cómo puedo ver los precios?",
    respuesta:
      "Los precios varían según la raza, tamaño y tipo de servicio. Escríbenos por WhatsApp con una foto de tu perro y te enviamos una cotización personalizada sin compromiso.",
  },
];

export default function FAQ() {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--ps-gold)" }}
          >
            Preguntas frecuentes
          </span>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Todo lo que necesitas saber
          </h2>
        </div>

        {/* Acordeón */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const estaAbierto = abierto === i;
            return (
              <motion.div
                key={i}
                initial={false}
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: estaAbierto
                    ? "var(--ps-lila-mid)"
                    : "oklch(90% 0.01 280)",
                  backgroundColor: estaAbierto
                    ? "var(--ps-lila-pale)"
                    : "white",
                  transition: "background-color 0.25s, border-color 0.25s",
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  onClick={() => setAbierto(estaAbierto ? null : i)}
                  aria-expanded={estaAbierto}
                >
                  <span
                    className="text-base font-semibold leading-snug"
                    style={{
                      color: estaAbierto
                        ? "var(--ps-lila-deep)"
                        : "var(--ps-text)",
                    }}
                  >
                    {faq.pregunta}
                  </span>
                  <motion.span
                    animate={{ rotate: estaAbierto ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0"
                    style={{
                      color: estaAbierto
                        ? "var(--ps-lila-deep)"
                        : "var(--ps-text-mid)",
                    }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {estaAbierto && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        className="px-6 pb-5 text-sm leading-relaxed"
                        style={{ color: "var(--ps-text-mid)" }}
                      >
                        {faq.respuesta}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA debajo */}
        <p
          className="text-center mt-10 text-sm"
          style={{ color: "var(--ps-text-mid)" }}
        >
          ¿Tienes otra consulta?{" "}
          <a
            href="https://wa.me/59675707476"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
            style={{ color: "var(--ps-lila-deep)" }}
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
