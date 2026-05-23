"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.25 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function PawSVG({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Toe pads */}
      <ellipse cx="22" cy="30" rx="10" ry="12" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="40" cy="18" rx="10" ry="12" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="62" cy="18" rx="10" ry="12" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="80" cy="30" rx="10" ry="12" stroke="currentColor" strokeWidth="1.4" />
      {/* Main pad */}
      <path
        d="M14,68 Q13,50 50,46 Q87,50 86,68 Q85,84 72,90 Q61,94 50,94 Q39,94 28,90 Q15,84 14,68Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

interface HeroProps {
  whatsapp: string;
}

export default function Hero({ whatsapp }: HeroProps) {
  return (
    <section className="relative min-h-[100svh] flex items-start lg:items-center overflow-hidden bg-white">
      {/* Background Image with Professional Overlay */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none flex lg:justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/*
          Móvil: El perro se muestra completo (object-bottom) para lucir patitas.
          Desktop: Elevamos al perro con object-[center_0%] para que toque casi el header.
        */}
        <div className="relative w-full h-full lg:w-[50%]">
          <Image
            src="/images/hero/perro1.jpeg"
            alt=""
            fill
            className="object-cover object-bottom lg:object-[center_0%]"
            priority
          />
          {/* Gradient Overlay (Desktop) - Smooth left edge */}
          <div 
            className="absolute inset-0 hidden lg:block"
            style={{ 
              background: "linear-gradient(to right, white 0%, rgba(255,255,255,0.7) 20%, transparent 40%)"
            }}
          />
          {/* Gradient Overlay (Mobile) - Capa de protección para el texto */}
          <div 
            className="absolute inset-0 lg:hidden"
            style={{ 
              background: `linear-gradient(to bottom, 
                white 0%, 
                rgba(255,255,255,0.92) 20%, 
                rgba(255,255,255,0.7) 45%, 
                rgba(255,255,255,0.2) 75%, 
                transparent 100%)`
            }}
          />
        </div>
      </motion.div>

      {/* Subtle Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-30">
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full filter blur-[120px] opacity-65 animate-pulse"
          style={{ backgroundColor: "var(--pastel-cyan)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[450px] h-[450px] rounded-full filter blur-[100px] opacity-55 animate-pulse"
          style={{ backgroundColor: "var(--pastel-pink)", animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-32 pb-4 lg:py-32 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center flex-1">
        {/* LEFT — Copy */}
        <motion.div
          className="flex flex-col gap-8"
          variants={container}
          initial="hidden"
          animate="visible"
        >
        {/* Badge */}
        <motion.div variants={item}>
          <span
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full border shadow-sm"
            style={{
              color: "var(--ps-gold-dark)",
              backgroundColor: "rgba(255,255,255,0.8)",
              borderColor: "oklch(0.72 0.12 78 / 0.5)",
            }}
          >
            ✦ Peluquería Premium
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
            className="leading-[1.1] font-light drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] lg:drop-shadow-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              color: "var(--ps-text)",
            }}
            variants={item}
          >
            Cuando ellos
            <br />
            están bien,
            <br />
            <em
              className="not-italic font-medium drop-shadow-sm"
              style={{ color: "var(--ps-gold)" }}
            >
              nosotros
            </em>
            <br />
            <em className="italic font-semibold text-ps-lila drop-shadow-sm">también</em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-base lg:text-lg leading-relaxed max-w-sm font-medium lg:font-normal drop-shadow-[0_1px_4px_rgba(255,255,255,1)] lg:drop-shadow-none"
            style={{ color: "var(--ps-text-mid)" }}
            variants={item}
          >
            Estética canina profesional, libre de estrés y personalizada.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            variants={item}
          >
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 font-semibold px-7 py-4 rounded-full text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              style={{
                backgroundColor: "var(--ps-gold)",
                boxShadow: "0 4px 24px oklch(0.72 0.12 78 / 0.3)",
              }}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Escribir por WhatsApp
            </a>
            <Link
              href="/#servicios"
              className="inline-flex items-center justify-center gap-2 font-bold px-7 py-4 rounded-full border-2 transition-all duration-300 hover:scale-[1.03] shadow-lg backdrop-blur-sm"
              style={{
                color: "var(--ps-lila)",
                borderColor: "var(--ps-lila)",
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
            >
              Reservar cita
              <span className="text-lg leading-none">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--ps-text-mid)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">
          Descubrir
        </span>
        <div
          className="w-px h-10"
          style={{
            background:
              "linear-gradient(to bottom, var(--ps-lila-mid), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
