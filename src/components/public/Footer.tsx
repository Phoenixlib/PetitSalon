import Link from "next/link";

const NAV = [
  { href: "/#nosotros", label: "Quiénes somos" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#resenas", label: "Reseñas" },
  { href: "/#faqs", label: "Preguntas frecuentes" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/reservar", label: "Reservar Cita" },
];

const SERVICIOS_LIST = [
  "Baño y Spa Premium",
  "Corte de Raza",
  "Deslanado",
  "Corte de Uñas y Limpieza",
  "Limpieza de Oídos",
];

export default function Footer({ whatsapp }: { whatsapp: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-16 lg:py-20"
      style={{ backgroundColor: "var(--ps-text)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top grid */}
        <div
          className="grid md:grid-cols-3 gap-12 pb-12"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div>
              <span
                className="text-2xl font-light"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "white",
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
              <p
                className="text-[10px] uppercase tracking-[0.25em] mt-1"
                style={{ color: "oklch(1 0 0 / 0.45)" }}
              >
                Peluquería Canina
              </p>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "oklch(1 0 0 / 0.55)" }}
            >
              Cuidado premium para tu mejor amigo. Amor y profesionalismo en
              cada visita.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--ps-gold)" }}
            >
              Servicios
            </p>
            <ul className="flex flex-col gap-3">
              {SERVICIOS_LIST.map((s) => (
                <li
                  key={s}
                  className="text-sm"
                  style={{ color: "oklch(1 0 0 / 0.55)" }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--ps-gold)" }}
            >
              Navegación
            </p>
            <ul className="flex flex-col gap-3">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-opacity hover:opacity-100"
                    style={{ color: "oklch(1 0 0 / 0.55)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>
            <p>© {year} Petit Salón. Todos los derechos reservados.</p>
            <span className="hidden sm:inline">•</span>
            <Link href="/politicas" className="hover:text-white transition-colors">
              Políticas de Servicio
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Acceso Administrativo
            </Link>
          </div>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--ps-gold)" }}
          >
            WhatsApp ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
