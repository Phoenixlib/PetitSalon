"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: "var(--ps-lila-base)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[560px] h-[560px] rounded-full opacity-50"
          style={{ backgroundColor: "var(--ps-lila-pale)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full opacity-35"
          style={{ backgroundColor: "var(--ps-lila-pale)" }}
        />
        {/* Subtle gold grain dot */}
        <div
          className="absolute top-1/3 left-1/2 w-1 h-1 rounded-full opacity-60"
          style={{ backgroundColor: "var(--ps-gold)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full py-32 grid lg:grid-cols-2 gap-16 items-center">
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
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full border"
              style={{
                color: "var(--ps-gold)",
                borderColor: "oklch(0.72 0.12 78 / 0.35)",
              }}
            >
              ✦ Peluquería Premium
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="leading-[0.92] font-light"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.2rem, 7vw, 5.5rem)",
              color: "var(--ps-text)",
            }}
            variants={item}
          >
            Donde cada
            <br />
            perro es
            <br />
            <em
              className="not-italic font-medium"
              style={{ color: "var(--ps-gold)" }}
            >
              tratado
            </em>
            <br />
            <em className="italic font-semibold">como realeza</em>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-base lg:text-lg leading-relaxed max-w-sm"
            style={{ color: "var(--ps-text-mid)" }}
            variants={item}
          >
            Baño, corte y cuidado de uñas con amor y profesionalismo. Porque tu
            mejor amigo merece sentirse increíble.
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
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-4 rounded-full border-2 transition-all duration-300 hover:scale-[1.03]"
              style={{
                color: "var(--ps-lila)",
                borderColor: "var(--ps-lila)",
              }}
            >
              Reservar cita
              <span className="text-lg leading-none">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT — Decoration */}
        <motion.div
          className="relative hidden lg:flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          {/* Main circle */}
          <div className="relative w-[420px] h-[420px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "var(--ps-lila-pale)",
                border: "1px solid oklch(0.80 0.05 295 / 0.5)",
              }}
            />
            {/* Inner ring (gold) */}
            <div
              className="absolute inset-[28px] rounded-full"
              style={{
                border: "1px solid oklch(0.72 0.12 78 / 0.18)",
              }}
            />

            {/* Image instead of Paw */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="relative w-64 h-64 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white z-20 aspect-square"
              >
                <img
                  src="/images/brand/logo.jpeg"
                  alt="Petit Salon Logo"
                  className="w-full h-full object-cover scale-[1.02]"
                />
              </motion.div>
            </div>

            {/* Gold dots */}
            <div
              className="absolute top-10 right-20 w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--ps-gold)" }}
            />
            <div
              className="absolute bottom-20 left-10 w-2 h-2 rounded-full opacity-60"
              style={{ backgroundColor: "var(--ps-gold)" }}
            />
            <div
              className="absolute top-28 left-6 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--ps-lila-mid)" }}
            />

            {/* Floating stat card */}
            <motion.div
              className="absolute -bottom-5 -right-6 rounded-2xl p-4 shadow-xl"
              style={{
                backgroundColor: "white",
                border: "1px solid var(--ps-lila-pale)",
                boxShadow: "0 8px 32px oklch(0.52 0.10 295 / 0.12)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Perros felices
              </p>
              <p
                className="text-3xl font-semibold mt-0.5"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ps-lila)",
                }}
              >
                +200
              </p>
            </motion.div>

            {/* Floating love card */}
            <motion.div
              className="absolute -top-5 -left-6 rounded-2xl p-3.5 shadow-xl"
              style={{
                backgroundColor: "white",
                border: "1px solid var(--ps-lila-pale)",
                boxShadow: "0 8px 32px oklch(0.52 0.10 295 / 0.12)",
              }}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="text-2xl">🐾</span>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider mt-1"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Con amor
              </p>
            </motion.div>
          </div>
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
