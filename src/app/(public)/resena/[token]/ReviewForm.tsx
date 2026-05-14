"use client";
import { useState, useActionState } from "react";
import { submitReviewAction } from "./actions";

interface Props {
  reviewId: string;
  ownerName: string;
  petName: string;
}

export default function ReviewForm({ reviewId, ownerName, petName }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const [state, formAction, isPending] = useActionState(
    submitReviewAction.bind(null, reviewId, rating),
    { errors: undefined, success: false },
  );

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <span className="text-6xl">🐾</span>
        <h2 className="text-2xl font-bold">¡Gracias, {ownerName}!</h2>
        <p className="text-gray-600">Tu reseña fue enviada correctamente.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
          ¿Cómo fue la experiencia de {petName}? 🐶
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tu opinión ayuda a otras familias a conocernos
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {/* Estrellas */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              {star <= (hovered || rating) ? "⭐" : "☆"}
            </button>
          ))}
        </div>

        {/* Texto */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Tu comentario *
          </label>
          <textarea
            name="text"
            rows={4}
            minLength={20}
            required
            placeholder="Cuéntanos cómo fue la atención, el resultado, el trato con tu perrito…"
            className="w-full rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none"
          />
        </div>

        {state.errors?._form && (
          <p className="text-red-500 text-sm">{state.errors._form[0]}</p>
        )}

        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="w-full rounded-full py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {isPending ? "Enviando…" : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
}
