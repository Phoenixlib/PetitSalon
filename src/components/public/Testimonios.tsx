"use client";

import { useState, useEffect, useRef } from "react";

const TESTIMONIOS = [
  {
    texto:
      "Mi golden retriever salió impecable y con el mejor olor. El trato fue súper cariñoso y profesional. ¡Volveremos siempre!",
    nombre: "Valentina R.",
    mascota: "Luna ★★★★★",
  },
  {
    texto:
      "Llevé a mi bichón por primera vez y quedé encantada. Lo trataron con mucha paciencia y el resultado fue hermoso. Totalmente recomendado.",
    nombre: "Camila M.",
    mascota: "Milo ★★★★★",
  },
  {
    texto:
      "Excelente servicio. Mi schnauzer es un poco nervioso pero quedó muy tranquilo. El corte quedó perfecto, tal como lo pedí.",
    nombre: "Fernanda G.",
    mascota: "Max ★★★★★",
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayData = (
    reviews.length > 0
      ? reviews.map((r) => ({
          texto: r.text,
          nombre: r.ownerName,
          mascota: `${r.petName} ${"★".repeat(r.rating)}`,
        }))
      : TESTIMONIOS
  ).slice(0, 9); // Mostrar un máximo curado de 9 reseñas

  const REVIEW_COLORS = [
    { bg: "var(--pastel-cyan)",   border: "rgba(182,230,230,0.6)",  quote: "#42c2ed" },
    { bg: "var(--pastel-pink)",   border: "rgba(249,206,223,0.6)",  quote: "#e91e63" },
    { bg: "var(--pastel-yellow)", border: "rgba(254,244,204,0.6)",  quote: "#d18910" },
  ];

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const isDesktop = window.innerWidth >= 1024;
      const step = isDesktop ? clientWidth * 0.33 : clientWidth;
      scrollContainerRef.current.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const isDesktop = window.innerWidth >= 1024;
      const step = isDesktop ? clientWidth * 0.33 : clientWidth;
      scrollContainerRef.current.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  // Efecto de Autoplay Inteligente (pausa al posicionar el mouse)
  useEffect(() => {
    if (displayData.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        
        // Si llegó al final (con un margen de 10px), vuelve al inicio suavemente
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Desplaza al siguiente elemento
          const cardElement = scrollContainerRef.current.firstElementChild as HTMLElement;
          const step = cardElement ? cardElement.clientWidth + 24 : clientWidth;
          scrollContainerRef.current.scrollBy({ left: step, behavior: "smooth" });
        }
      }
    }, 5500);

    return () => clearInterval(interval);
  }, [displayData.length, isHovered]);

  return (
    <section
      id="resenas"
      className="py-28 lg:py-36 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #f0fafa 0%, #ffffff 50%, #fef4cc 100%)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
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
              className="mt-5 w-12 h-px mx-auto md:mx-0"
              style={{ backgroundColor: "var(--ps-gold)" }}
            />
          </div>

          {/* Flechas de Navegación del Carrusel */}
          {displayData.length > 1 && (
            <div className="flex justify-center md:justify-end gap-3">
              <button
                onClick={scrollLeft}
                className="p-3.5 text-black/60 hover:text-black bg-black/5 hover:bg-black/10 border border-black/5 rounded-full transition-all duration-300 transform active:scale-95 shadow-sm"
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
                className="p-3.5 text-black/60 hover:text-black bg-black/5 hover:bg-black/10 border border-black/5 rounded-full transition-all duration-300 transform active:scale-95 shadow-sm"
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

        {/* Carrusel Horizontal responsivo */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 lg:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-1 scrollbar-none"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {displayData.map((t, i) => {
              const color = REVIEW_COLORS[i % REVIEW_COLORS.length];
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-full lg:w-[31.5%] snap-center lg:snap-start flex flex-col gap-5 p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: color.bg,
                    border: `1.5px solid ${color.border}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Cita decorativa de fondo */}
                  <span
                    className="absolute -top-4 -left-2 text-9xl font-light leading-none select-none pointer-events-none"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: color.quote,
                      opacity: 0.1,
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
                      opacity: 0.7,
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
                    <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--ps-text-mid)" }}>
                      {t.mascota}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de progreso de desplazamiento sutil */}
          {displayData.length > 1 && (
            <div className="mt-8 max-w-xs mx-auto h-[3px] bg-black/10 rounded-full overflow-hidden">
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
      </div>
    </section>
  );
}
