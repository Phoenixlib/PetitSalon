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

  // Sincronizar estado local cuando cambia la data del servidor (ej. tras revalidaciones)
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
          {totalCount}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay reseñas aquí.</p>
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
