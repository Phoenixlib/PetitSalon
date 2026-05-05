"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/59675707476";

const NAV_LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 1px 24px oklch(0.52 0.10 295 / 0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span
            className="text-[1.6rem] font-light tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Petit{" "}
            <em
              className="not-italic font-semibold"
              style={{ color: "var(--ps-gold)" }}
            >
              Salón
            </em>
          </span>
          <span
            className="text-[9px] uppercase tracking-[0.25em] mt-0.5"
            style={{ color: "var(--ps-text-mid)" }}
          >
            Peluquería Canina
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors duration-200 hover:text-ps-lila"
              style={{ color: "var(--ps-text-mid)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--ps-gold)" }}
          >
            WhatsApp ↗
          </a>
          <Link
            href="/reservar"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{ backgroundColor: "var(--ps-lila)" }}
          >
            Reservar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          style={{ color: "var(--ps-text)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="px-6 pt-4 pb-6 flex flex-col gap-4 bg-white"
          style={{ borderTop: "1px solid var(--ps-lila-pale)" }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base font-medium py-1"
              style={{ color: "var(--ps-text)" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center font-semibold py-3 rounded-full border text-sm"
              style={{
                color: "var(--ps-gold)",
                borderColor: "var(--ps-gold)",
              }}
            >
              Escribir por WhatsApp
            </a>
            <Link
              href="/reservar"
              className="text-center font-semibold py-3 rounded-full text-sm text-white"
              style={{ backgroundColor: "var(--ps-lila)" }}
              onClick={() => setMenuOpen(false)}
            >
              Reservar cita
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
