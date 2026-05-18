"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { logoutAction } from "@/app/admin/actions";

const NAV_LINKS = [
  { href: "/#nosotros", label: "Quiénes somos" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#resenas", label: "Reseñas" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#ubicacion", label: "Ubicación" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/citas", label: "Citas" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/perros", label: "Perros" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/contenido", label: "Contenido" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/resenas", label: "Reseñas" },
  { href: "/admin/campanas", label: "Campañas" },
];

type Props = {
  isAuthenticated?: boolean;
  whatsapp: string;
};

export default function Header({ isAuthenticated = false, whatsapp }: Props) {
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
        backgroundColor:
          scrolled || isAdminPage ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled || isAdminPage ? "blur(16px)" : "none",
        boxShadow:
          scrolled || isAdminPage ? "0 1px 24px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-petitsalon.png"
            alt="Petit Salón"
            width={1397}
            height={512}
            className="h-10 md:h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        {!isAdminPage && (
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
          </nav>
        )}

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {!isAdminPage && (
                <>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "var(--ps-gold)" }}
                  >
                    WhatsApp ↗
                  </a>
                  <Link
                    href="/#servicios"
                    className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: "var(--ps-lila)" }}
                  >
                    Reservar
                  </Link>
                </>
              )}
              <Link
                href="/admin"
                className="text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all duration-200 hover:opacity-80 flex items-center gap-1.5"
                style={{
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                  backgroundColor: isAdminPage
                    ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                    : "transparent",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
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
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--ps-gold)" }}
              >
                WhatsApp ↗
              </a>
              <Link
                href="/#servicios"
                className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: "var(--ps-lila)" }}
              >
                Reservar
              </Link>
              <Link
                href="/admin/login"
                className="text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--ps-text-mid)",
                }}
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
          <svg
            width="22"
            height="22"
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-full inset-x-0 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundColor: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        <nav
          className="px-6 pt-4 pb-6 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {isAdminPage ? (
            /* Admin menu (only shown when inside the admin pages) */
            <>
              <p
                className="text-[10px] uppercase tracking-[0.2em] mt-2 mb-2 font-semibold"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Navegación Admin
              </p>
              {ADMIN_NAV.map(({ href, label }) => {
                const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="text-base font-medium py-2.5 border-b flex items-center justify-between"
                    style={{
                      color: isActive ? "var(--primary)" : "var(--ps-text)",
                      borderColor: "var(--border)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                  </Link>
                );
              })}

              <div className="flex flex-col gap-3 mt-6">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full text-center font-semibold py-3 rounded-full text-sm border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </form>
                <Link
                  href="/"
                  className="text-center font-semibold py-3 rounded-full text-sm text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Volver al Landing Page
                </Link>
              </div>
            </>
          ) : (
            /* Public menu (only shown when in public landing pages) */
            <>
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

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-4">
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center font-semibold py-3 rounded-full border text-sm"
                  style={{ color: "var(--ps-gold)", borderColor: "var(--ps-gold)" }}
                >
                  Escribir por WhatsApp
                </a>
                <Link
                  href="/#servicios"
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
                    style={{
                      borderColor: "var(--primary)",
                      color: "var(--primary)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Panel de administración
                  </Link>
                ) : (
                  <Link
                    href="/admin/login"
                    className="text-center font-medium py-3 rounded-full text-sm border"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--ps-text-mid)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
