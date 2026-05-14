const TESTIMONIOS = [
  {
    texto:
      "Mi golden retriever salió impecable y con el mejor olor. El trato fue súper cariñoso y profesional. ¡Volveremos siempre!",
    nombre: "Valentina R.",
    mascota: "Luna, Golden Retriever 🐶",
  },
  {
    texto:
      "Llevé a mi bichón por primera vez y quedé encantada. Lo trataron con mucha paciencia y el resultado fue hermoso. Totalmente recomendado.",
    nombre: "Camila M.",
    mascota: "Milo, Bichón Frisé 🐩",
  },
  {
    texto:
      "Excelente servicio. Mi schnauzer es un poco nervioso pero quedó muy tranquilo. El corte quedó perfecto, tal como lo pedí.",
    nombre: "Fernanda G.",
    mascota: "Max, Schnauzer 🐕",
  },
];

interface ReviewData {
  id: string;
  ownerName: string;
  petName: string;
  rating: number;
  text: string;
}

interface Props {
  reviews?: ReviewData[];
}

export default function Testimonios({ reviews = [] }: Props) {
  const displayData =
    reviews.length > 0
      ? reviews.map((r) => ({
          texto: r.text,
          nombre: r.ownerName,
          mascota: `${r.petName} ${"⭐".repeat(r.rating)}`,
        }))
      : TESTIMONIOS;

  const REVIEW_COLORS = [
    { bg: "var(--pastel-cyan)",   border: "rgba(182,230,230,0.6)",  quote: "#42c2ed" },
    { bg: "var(--pastel-pink)",   border: "rgba(249,206,223,0.6)",  quote: "#e91e63" },
    { bg: "var(--pastel-yellow)", border: "rgba(254,244,204,0.6)",  quote: "#d18910" },
  ];

  return (
    <section
      className="py-28 lg:py-36"
      style={{
        background: "linear-gradient(160deg, #f0fafa 0%, #ffffff 50%, #fef4cc 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--ps-gold)" }}
          >
            ✦ Opiniones
          </span>
          <h2
            className="mt-3 font-light leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              color: "var(--ps-text)",
            }}
          >
            Lo que dicen{" "}
            <em
              className="italic font-medium"
              style={{ color: "var(--ps-lila)" }}
            >
              nuestros clientes
            </em>
          </h2>
          <div
            className="mt-5 w-12 h-px"
            style={{ backgroundColor: "var(--ps-gold)" }}
          />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {displayData.map((t, i) => {
            const color = REVIEW_COLORS[i % REVIEW_COLORS.length];
            return (
              <div
                key={i}
                className="flex flex-col gap-5 p-8 rounded-3xl relative overflow-hidden"
                style={{
                  backgroundColor: color.bg,
                  border: `1.5px solid ${color.border}`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                }}
              >
                {/* Cita decorativa de fondo */}
                <span
                  className="absolute -top-4 -left-2 text-9xl font-light leading-none select-none pointer-events-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: color.quote,
                    opacity: 0.12,
                  }}
                >
                  &ldquo;
                </span>

                {/* Cita visible */}
                <span
                  className="text-4xl font-light leading-none select-none relative z-10"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: color.quote,
                    opacity: 0.8,
                  }}
                >
                  &ldquo;
                </span>

                <p
                  className="text-sm leading-relaxed -mt-3 flex-1 relative z-10"
                  style={{ color: "var(--ps-text-mid)" }}
                >
                  {t.texto}
                </p>

                {/* Author */}
                <div
                  className="pt-4 relative z-10"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--ps-text)" }}>
                    {t.nombre}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ps-text-mid)" }}>
                    {t.mascota}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
