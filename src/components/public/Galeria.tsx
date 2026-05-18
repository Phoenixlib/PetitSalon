"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryPhotoPublic {
  id: string;
  photoUrl: string;
  caption: string | null;
}

interface Props {
  photos: GalleryPhotoPublic[];
}

export default function Galeria({ photos }: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoPublic | null>(null);

  const closePreview = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Cerrar modal con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview]);

  return (
    <section
      id="galeria"
      className="py-28 lg:py-36 relative overflow-hidden"
      style={{ backgroundColor: "var(--ps-lila-base)" }}
    >
      {/* Elementos decorativos sutiles de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ backgroundColor: "var(--ps-lila-light)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ backgroundColor: "var(--ps-gold)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--ps-gold)" }}
          >
            ✦ Nuestro Trabajo
          </span>
          <h2
            className="mt-3 font-light leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              color: "var(--ps-text)",
            }}
          >
            Galería de{" "}
            <em
              className="italic font-medium"
              style={{ color: "var(--ps-lila)" }}
            >
              resultados
            </em>
          </h2>
          <div
            className="mt-5 w-12 h-px mx-auto md:mx-0"
            style={{ backgroundColor: "var(--ps-gold)" }}
          />
          <p
            className="mt-4 text-sm max-w-md mx-auto md:mx-0"
            style={{ color: "var(--ps-text-mid)" }}
          >
            {photos.length === 0
              ? "Las fotos reales de nuestros consentidos se mostrarán aquí muy pronto."
              : "Amor y dedicación reflejados en cada detalle. Aquí puedes ver el resultado final de nuestros clientes peluditos."}
          </p>
        </div>

        {photos.length === 0 ? (
          /* Empty state */
          <div className="flex justify-center py-10">
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] px-6 py-3 rounded-full shadow-sm"
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
          /* Masonry responsive grid using CSS columns */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer border shadow-sm hover:shadow-xl transition-all duration-300 w-full mb-6"
                style={{
                  borderColor: "var(--ps-lila-light)",
                  backgroundColor: "white",
                }}
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Image Wrap */}
                <div className="relative overflow-hidden w-full h-auto">
                  {/* Aspect ratios vary for organic masonry feeling. We can use natural vertical/horizontal display flow. */}
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption ?? "Foto de peluquería canina"}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Subtle Elegant Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 mb-1">
                      Ver Resultado ✦
                    </span>
                    {photo.caption && (
                      <p className="text-white text-xs font-medium leading-relaxed line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={closePreview}
          >
            {/* Close Button */}
            <button
              onClick={closePreview}
              className="absolute top-6 right-6 z-[110] p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label="Cerrar vista"
            >
              <span className="text-lg font-light">✕</span>
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image element (using native img for flexible fluid layout in modal) */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex items-center justify-center">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.caption ?? "Resultado"}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>

              {/* Caption Overlay at the bottom */}
              {selectedPhoto.caption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 text-center max-w-xl"
                >
                  <p className="text-white text-sm font-medium tracking-wide bg-white/10 backdrop-blur-md px-6 py-2 rounded-full inline-block border border-white/5">
                    {selectedPhoto.caption}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
