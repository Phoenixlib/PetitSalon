"use client";

import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";
import { getReviewsAction } from "./actions";

interface Props {
  title: string;
  initialReviews: any[];
  totalCount: number;
  badgeColor: string;
  type: "PENDING" | "APPROVED" | "REJECTED" | "WAITING";
}

export default function ReviewColumn({ title, initialReviews, totalCount, badgeColor, type }: Props) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sincronizar estado local cuando cambia la data del servidor (ej. tras revalidaciones)
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  // Colapsar por defecto en móviles/tablets (ancho < 1024px) excepto la columna de PENDING (Nuevas)
  useEffect(() => {
    const handleInitialCollapse = () => {
      if (window.innerWidth < 1024 && type !== "PENDING") {
        setIsCollapsed(true);
      }
    };
    handleInitialCollapse();
  }, [type]);

  const handleLoadMore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const more = await getReviewsAction(type, reviews.length, 10);
      setReviews((prev) => [...prev, ...more]);
    } catch (error) {
      console.error("Error al cargar más reseñas:", error);
      alert("Hubo un problema al cargar más reseñas.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasMore = reviews.length < totalCount;

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-2xl bg-gray-50 border transition-all duration-200"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Encabezado clickable/interactivo */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full text-left focus:outline-none select-none group"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-base md:text-lg" style={{ color: "var(--ps-text)" }}>
            {title}
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${badgeColor}`}>
            {totalCount}
          </span>
        </div>

        {/* Flecha indicadora (Chevron) */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 group-hover:text-purple-600 group-hover:border-purple-300 shadow-sm transition-all duration-200">
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${
              isCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Cuerpo colapsable */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 overflow-hidden ${
          isCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[5000px] opacity-100"
        }`}
      >
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-2">No hay reseñas aquí.</p>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}

        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Cargando...</span>
              </>
            ) : (
              <span>Cargar más reseñas</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
