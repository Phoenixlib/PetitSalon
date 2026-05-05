import { MapPin } from "lucide-react";

export default function Ubicacion() {
  return (
    <section className="py-20 px-4 bg-white relative">
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
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "var(--ps-text-mid)" }}
              >
                Carvajal 330,
                <br />
                La Cisterna,
                <br />
                Santiago, Chile.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Carvajal+330,+La+Cisterna,+Chile"
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3325.297746594244!2d-70.6693892!3d-33.5244199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae31a1a7995%3A0xe5772390f7adca0!2sCarvajal%20330%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana%2C%20Chile!5e0!3m2!1ses-419!2scl!4v1714856000000!5m2!1ses-419!2scl"
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
