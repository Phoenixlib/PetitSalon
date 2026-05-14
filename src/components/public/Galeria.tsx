"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

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
  const [selectedPair, setSelectedPair] = useState<GalleryPairPublic | null>(null);

  const closePreview = useCallback(() => {
    setSelectedPair(null);
  }, []);

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
                  <div 
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedPair(pair)}
                  >
                    <Image
                      src={pair.beforeUrl}
                      alt={`Antes — ${pair.breed ?? "perrito"}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-black/50 text-white rounded-full px-1.5 py-0.5">
                        Antes
                      </span>
                    </div>
                  </div>
                  {/* After */}
                  <div 
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedPair(pair)}
                  >
                    <Image
                      src={pair.afterUrl}
                      alt={`Después — ${pair.breed ?? "perrito"}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
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

      {/* Modal de Preview */}
      {selectedPair && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal (mobile) */}
            <div className="flex md:hidden items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800">
                {selectedPair.breed ?? "Resultado"}
              </h3>
              <button
                onClick={closePreview}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Before */}
            <div className="flex-1 relative flex flex-col bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="absolute top-4 left-4 z-10">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/90 text-gray-800 px-3 py-1 rounded-full shadow-sm">
                  Antes
                </span>
              </div>
              <div className="relative w-full aspect-square md:aspect-auto md:h-full min-h-[300px]">
                <Image
                  src={selectedPair.beforeUrl}
                  alt="Antes"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* After */}
            <div className="flex-1 relative flex flex-col bg-gray-50">
              <div className="absolute top-4 left-4 z-10">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/90 text-gray-800 px-3 py-1 rounded-full shadow-sm">
                  Después
                </span>
              </div>
              
              {/* Botón de cerrar (desktop) */}
              <div className="hidden md:block absolute top-4 right-4 z-10">
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-600 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="relative w-full aspect-square md:aspect-auto md:h-full min-h-[300px]">
                <Image
                  src={selectedPair.afterUrl}
                  alt="Después"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            
            {/* Pie del modal (desktop) */}
            {selectedPair.breed && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex">
                <span className="text-sm font-medium bg-black/60 text-white px-4 py-1.5 rounded-full backdrop-blur-md">
                  {selectedPair.breed}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
