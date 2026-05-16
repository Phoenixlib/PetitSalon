import { MapPin } from "lucide-react";

interface UbicacionProps {
  address: string;
}

export default function Ubicacion({ address }: UbicacionProps) {
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <section id="ubicacion" className="py-20 px-4 bg-white relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--ps-gold)" }}
          >
            Nuestra Casa
          </span>
          <h2
            className="text-4xl md:text-5xl font-light mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ps-text)",
            }}
          >
            Cómo llegar
          </h2>
          <p className="text-lg" style={{ color: "var(--ps-text-mid)" }}>
            Nos encontramos en un espacio tranquilo y seguro para tu mascota.
          </p>
        </div>

        {/* Contenedor del Mapa */}
        <div
          className="bg-white rounded-3xl shadow-xl overflow-hidden border"
          style={{ borderColor: "var(--ps-lila-pale)" }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Info Panel */}
            <div
              className="p-8 md:p-12 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r"
              style={{
                borderColor: "var(--ps-lila-pale)",
                backgroundColor: "var(--ps-lila-pale)",
              }}
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <MapPin className="w-7 h-7 text-pink-500" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--ps-text)" }}
              >
                Petit Salon
              </h3>
              <p
                className="text-lg mb-6 leading-relaxed whitespace-pre-line"
                style={{ color: "var(--ps-text-mid)" }}
              >
                {address}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white px-6 py-3 rounded-full font-semibold transition-transform hover:-translate-y-1 shadow-md w-full text-center"
                style={{
                  color: "var(--ps-lila-deep)",
                  border: "1px solid var(--ps-lila-mid)",
                }}
              >
                Abrir en Google Maps
              </a>
            </div>

            {/* Iframe Mapa */}
            <div className="md:w-2/3 h-[400px] md:h-auto min-h-[400px] relative">
              <iframe
                src={mapUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de ubicación Petit Salon"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
