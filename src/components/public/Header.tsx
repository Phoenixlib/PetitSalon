"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/56937541863";

const NAV_LINKS = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/citas", label: "Citas" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/perros", label: "Perros" },
];

type Props = {
  isAuthenticated?: boolean;
};

export default function Header({ isAuthenticated = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-16 flex flex-col justify-center transition-all duration-500"
      style={{
        backgroundColor: scrolled || isAdminPage ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled || isAdminPage ? "blur(16px)" : "none",
        boxShadow: scrolled || isAdminPage ? "0 1px 24px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span
            className="text-[1.5rem] font-light tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ps-text)" }}
          >
            Petit{" "}
            <em className="not-italic font-semibold" style={{ color: "var(--ps-gold)" }}>
              Salón
            </em>
          </span>
          <span
            className="text-[8px] uppercase tracking-[0.25em]"
            style={{ color: "var(--ps-text-mid)" }}
          >
            Peluquería Canina
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors duration-200 hover:opacity-70"
              style={{ color: "var(--ps-text-mid)" }}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/admin"
              className="text-sm font-medium transition-colors duration-200 hover:opacity-70"
              style={{
                color: isAdminPage ? "var(--primary)" : "var(--ps-text-mid)",
                fontWeight: isAdminPage ? 600 : 400,
              }}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
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
                className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: "var(--ps-lila)" }}
              >
                Reservar
              </Link>
              <Link
                href="/admin"
                className="text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all duration-200 hover:opacity-80 flex items-center gap-1.5"
                style={{
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                  backgroundColor: isAdminPage ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Panel
              </Link>
            </>
          ) : (
            <>
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
                className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: "var(--ps-lila)" }}
              >
                Reservar
              </Link>
              <Link
                href="/admin/login"
                className="text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--ps-text-mid)" }}
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md"
          style={{ color: "var(--ps-text)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full inset-x-0 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)" }}
      >
        <nav
          className="px-6 pt-4 pb-6 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Public nav */}
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base font-medium py-2.5 border-b"
              style={{ color: "var(--ps-text)", borderColor: "var(--border)" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Admin nav (solo si autenticado) */}
          {isAuthenticated && (
            <>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-4 mb-1 font-semibold"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Administración
              </p>
              {ADMIN_NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium py-2 border-b flex items-center justify-between"
                  style={{
                    color: pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "var(--primary)" : "var(--ps-text)",
                    borderColor: "var(--border)",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                  {(pathname === href || (href !== "/admin" && pathname.startsWith(href))) && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                  )}
                </Link>
              ))}
            </>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center font-semibold py-3 rounded-full border text-sm"
              style={{ color: "var(--ps-gold)", borderColor: "var(--ps-gold)" }}
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
            {isAuthenticated ? (
              <Link
                href="/admin"
                className="text-center font-semibold py-3 rounded-full text-sm border-2"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                onClick={() => setMenuOpen(false)}
              >
                Panel de administración
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="text-center font-medium py-3 rounded-full text-sm border"
                style={{ borderColor: "var(--border)", color: "var(--ps-text-mid)" }}
                onClick={() => setMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

