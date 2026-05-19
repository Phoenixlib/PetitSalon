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

          {/* Botón para ver reseñas de Google */}
          <div className="mt-8 flex justify-center">
            <a
              href="https://www.google.com/maps/place/Petit+Salon+-+Peluqueria+Canina/@-33.5161333,-70.6645456,17z/data=!3m1!4b1!4m6!3m5!1s0x9662dbafc28945df:0x58318dd2c3132864!8m2!3d-33.5161333!4d-70.6619707!16s%2Fg%2F11wc5qrf0t?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md active:scale-95"
            >
              {/* Logo de Google SVG a color */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Ver opiniones en Google</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
