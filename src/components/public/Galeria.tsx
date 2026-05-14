import Image from "next/image";

interface GalleryPairPublic {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  breed: string | null;
}

interface Props {
  pairs: GalleryPairPublic[];
}

export default function Galeria({ pairs }: Props) {
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
            <em
              className="italic font-medium"
              style={{ color: "var(--ps-lila)" }}
            >
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
            {pairs.length === 0
              ? "Las fotos reales del negocio se mostrarán aquí muy pronto."
              : "Resultados reales de nuestros clientes peludos."}
          </p>
        </div>

        {pairs.length === 0 ? (
          /* Empty state */
          <div className="flex justify-center">
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
        ) : (
          /* Dynamic grid */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {pairs.map((pair) => (
              <div key={pair.id} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* Before */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={pair.beforeUrl}
                      alt={`Antes — ${pair.breed ?? "perrito"}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                    <div className="absolute inset-0 flex items-end p-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-black/50 text-white rounded-full px-1.5 py-0.5">
                        Antes
                      </span>
                    </div>
                  </div>
                  {/* After */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={pair.afterUrl}
                      alt={`Después — ${pair.breed ?? "perrito"}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                    <div className="absolute inset-0 flex items-end p-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-black/50 text-white rounded-full px-1.5 py-0.5">
                        Después
                      </span>
                    </div>
                  </div>
                </div>
                {pair.breed && (
                  <p
                    className="text-xs text-center font-medium"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    {pair.breed}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
