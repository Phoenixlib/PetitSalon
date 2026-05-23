"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  whatsapp: string;
}

export default function FAQ({ items, whatsapp }: FAQProps) {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <section id="faqs" className="py-20 px-4 bg-white">
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
          {items.map((faq) => {
            const estaAbierto = abierto === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={false}
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: estaAbierto
                    ? "var(--ps-gold)"
                    : "oklch(90% 0.01 280)",
                  backgroundColor: estaAbierto
                    ? "var(--ps-gold-light)"
                    : "white",
                  transition: "background-color 0.25s, border-color 0.25s",
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  onClick={() => setAbierto(estaAbierto ? null : faq.id)}
                  aria-expanded={estaAbierto}
                >
                  <span
                    className="text-base font-semibold leading-snug"
                    style={{
                      color: estaAbierto
                        ? "var(--ps-gold-dark)"
                        : "var(--ps-text)",
                    }}
                  >
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: estaAbierto ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0"
                    style={{
                      color: estaAbierto
                        ? "var(--ps-gold-dark)"
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
                        {faq.answer}
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
            href={`https://wa.me/${whatsapp}`}
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
