import { MapPin, Mail, Map, Car, Dog } from "lucide-react";

interface AcercaDeNosotrosProps {
  about_text: string;
  whatsapp: string;
  email: string;
  address: string;
  parking: boolean;
}

export default function AcercaDeNosotros({
  about_text,
  whatsapp,
  email,
  address,
  parking,
}: AcercaDeNosotrosProps) {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: "var(--ps-lila-pale)" }}
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div className="space-y-6">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--ps-gold)" }}
          >
            Nuestra Filosofía
          </span>
          <h2
            className="text-4xl md:text-5xl font-light"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Acerca de Nosotros
          </h2>

          <div
            className="space-y-4 text-base leading-relaxed"
            style={{ color: "var(--ps-text-mid)", whiteSpace: "pre-line" }}
          >
            <p dangerouslySetInnerHTML={{ __html: about_text }}></p>
          </div>

          {/* Badges de Amenidades */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm"
              style={{ borderColor: "var(--ps-lila-mid)" }}
            >
              <Dog
                className="w-5 h-5"
                style={{ color: "var(--ps-lila-deep)" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--ps-text)" }}
              >
                Atendemos Perros
              </span>
            </div>
            {parking && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm"
                style={{ borderColor: "var(--ps-lila-mid)" }}
              >
                <Car className="w-5 h-5 text-pink-500" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--ps-text)" }}
                >
                  Estacionamiento
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contacto Rápido Visual */}
        <div
          className="bg-white p-8 rounded-3xl shadow-sm border space-y-6"
          style={{ borderColor: "oklch(90% 0.01 280)" }}
        >
          <h3
            className="text-xl font-semibold mb-6"
            style={{ color: "var(--ps-text)" }}
          >
            Información de Contacto
          </h3>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.322.101.144.453.715 1.05 1.132.72.484 1.303.626 1.48.694.173.072.289.058.39-.057.101-.116.448-.521.575-.684.116-.16.231-.131.39-.072l1.087.51c.144.072.246.101.289.16.037.05.037.319-.107.724z" />
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                WhatsApp
              </p>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--ps-text)" }}
              >
                +{whatsapp.slice(0, 2)} {whatsapp.slice(2, 3)} {whatsapp.slice(3, 7)} {whatsapp.slice(7)}
              </p>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--ps-lila-pale)" }}
            >
              <Mail
                className="w-6 h-6"
                style={{ color: "var(--ps-lila-deep)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Correo Electrónico
              </p>
              <p
                className="text-base font-medium break-all"
                style={{ color: "var(--ps-text)" }}
              >
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--ps-lila-pale)" }}
            >
              <MapPin className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Ubicación
              </p>
              <p
                className="text-base font-medium"
                style={{ color: "var(--ps-text)" }}
              >
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
