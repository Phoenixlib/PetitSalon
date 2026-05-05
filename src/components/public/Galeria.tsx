const PLACEHOLDERS = [
  { id: 1, raza: "Golden Retriever" },
  { id: 2, raza: "Bichón Frisé" },
  { id: 3, raza: "Schnauzer" },
  { id: 4, raza: "Caniche" },
];

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2"
      style={{
        background:
          "linear-gradient(135deg, var(--ps-lila-pale) 0%, var(--ps-lila-light) 100%)",
      }}
    >
      <span className="text-3xl opacity-50">📷</span>
      <span
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{ color: "var(--ps-lila-mid)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Galeria() {
  return (
    <section
      id="galeria"
      className="py-28 lg:py-36"
      style={{ backgroundColor: "var(--ps-lila-base)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--ps-gold)" }}
          >
            ✦ Resultados
          </span>
          <h2
            className="mt-3 font-light leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              color: "var(--ps-text)",
            }}
          >
            Antes &{" "}
            <em className="italic font-medium" style={{ color: "var(--ps-lila)" }}>
              después
            </em>
          </h2>
          <div
            className="mt-5 w-12 h-px"
            style={{ backgroundColor: "var(--ps-gold)" }}
          />
          <p
            className="mt-4 text-sm max-w-md"
            style={{ color: "var(--ps-text-mid)" }}
          >
            Las fotos reales del negocio se mostrarán aquí muy pronto.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {PLACEHOLDERS.map(({ id, raza }) => (
            <div key={id} className="flex flex-col gap-3">
              {/* Before / After */}
              <div className="grid grid-cols-2 gap-2">
                <PhotoPlaceholder label="Antes" />
                <PhotoPlaceholder label="Después" />
              </div>
              {/* Label */}
              <p
                className="text-xs text-center font-medium"
                style={{ color: "var(--ps-text-mid)" }}
              >
                {raza}
              </p>
            </div>
          ))}
        </div>

        {/* Coming soon badge */}
        <div className="mt-14 flex justify-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full"
            style={{
              backgroundColor: "white",
              color: "var(--ps-lila)",
              border: "1px solid var(--ps-lila-light)",
            }}
          >
            ✨ Fotos reales muy pronto
          </span>
        </div>
      </div>
    </section>
  );
}
