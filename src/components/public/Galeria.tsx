"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedPhoto = selectedIdx !== null ? photos[selectedIdx] : null;

  const closePreview = useCallback(() => {
    setSelectedIdx(null);
  }, []);

  const nextPhoto = useCallback(() => {
    if (selectedIdx === null || photos.length === 0) return;
    setSelectedIdx((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
  }, [selectedIdx, photos]);

  const prevPhoto = useCallback(() => {
    if (selectedIdx === null || photos.length === 0) return;
    setSelectedIdx((prev) =>
      prev === null ? 0 : (prev - 1 + photos.length) % photos.length,
    );
  }, [selectedIdx, photos]);

  // Manejo de scroll para actualizar la barra de progreso
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      if (totalScrollable > 0) {
        const progress = (scrollLeft / totalScrollable) * 100;
        setScrollProgress(progress);
      }
    }
  };

  // Desplazamiento manual del carrusel con las flechas
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth * 0.8; // desplaza aproximadamente el 80% del viewport
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  // Navegación con teclado (Escape, Flechas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, closePreview, nextPhoto, prevPhoto]);

  return (
    <section
      id="galeria"
      className="py-28 lg:py-36 relative overflow-hidden"
      style={{ backgroundColor: "var(--ps-lila-base)" }}
    >
      {/* Elementos decorativos sutiles de fondo */}
      <div className="absolute -top-12 -left-12 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-3xl opacity-45 animate-pulse pointer-events-none" style={{ backgroundColor: "var(--ps-lila-light)" }} />
      <div className="absolute -bottom-12 -right-12 w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-pulse pointer-events-none" style={{ backgroundColor: "var(--ps-gold)", animationDelay: "1.5s" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
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
          </div>

          {/* Flechas de Navegación del Carrusel (Estilo Refinado y Visible) */}
          {photos.length > 1 && (
            <div className="flex justify-center md:justify-end gap-3">
              <button
                onClick={scrollLeft}
                className="p-3.5 bg-white hover:bg-[var(--ps-lila-pale)] border rounded-full transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center"
                style={{ borderColor: "var(--ps-lila-light)", color: "var(--ps-lila)" }}
                aria-label="Desplazar a la izquierda"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                className="p-3.5 bg-white hover:bg-[var(--ps-lila-pale)] border rounded-full transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center"
                style={{ borderColor: "var(--ps-lila-light)", color: "var(--ps-lila)" }}
                aria-label="Desplazar a la derecha"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

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
          <div className="relative">
            {/* Contenedor del Carrusel horizontal con CSS Scroll Snap */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-1 scrollbar-none"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {photos.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="flex-shrink-0 w-[80vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] snap-start relative aspect-[4/5] rounded-[2rem] overflow-hidden group cursor-pointer border shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
                  style={{
                    borderColor: "var(--ps-lila-light)",
                  }}
                  onClick={() => setSelectedIdx(idx)}
                >
                  {/* Image Wrap */}
                  <div className="relative w-full h-full">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption ?? "Foto de peluquería canina"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                    />
                    
                    {/* Subtle Elegant Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
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

            {/* Barra de progreso de desplazamiento sutil */}
            {photos.length > 1 && (
              <div className="mt-8 max-w-xs mx-auto h-[3px] bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${scrollProgress}%`,
                    backgroundColor: "var(--ps-gold)",
                  }}
                />
              </div>
            )}
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
            onClick={closePreview}
          >
            {/* Botón de Cerrar */}
            <button
              onClick={closePreview}
              className="absolute top-6 right-6 z-[120] p-3.5 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label="Cerrar vista"
            >
              <span className="text-lg font-light block leading-none w-4 h-4 flex items-center justify-center">✕</span>
            </button>

            {/* Flecha Izquierda (Anterior) */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute left-4 md:left-8 z-[120] p-3.5 md:p-4 text-white/75 hover:text-white bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/5"
                aria-label="Foto anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Flecha Derecha (Siguiente) */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-4 md:right-8 z-[120] p-3.5 md:p-4 text-white/75 hover:text-white bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/5"
                aria-label="Siguiente foto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Container Principal de la Imagen */}
            <motion.div
              initial={{ scale: 0.97, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animación del cambio de imagen usando wait mode */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedPhoto.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    src={selectedPhoto.photoUrl}
                    alt={selectedPhoto.caption ?? "Resultado"}
                    className="max-h-[68vh] max-w-full object-contain pointer-events-none"
                  />
                </AnimatePresence>
              </div>

              {/* Texto explicativo en el footer del modal */}
              <AnimatePresence mode="wait">
                {selectedPhoto.caption && (
                  <motion.div
                    key={`caption-${selectedPhoto.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="mt-5 text-center max-w-xl"
                  >
                    <p className="text-white text-xs md:text-sm font-medium tracking-wide bg-white/10 backdrop-blur-md px-5 py-2 rounded-full inline-block border border-white/5 shadow-md">
                      {selectedPhoto.caption}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
