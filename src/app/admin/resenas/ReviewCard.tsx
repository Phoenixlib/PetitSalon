"use client";

import { useTransition } from "react";
import { updateReviewStatusAction, deleteReviewAction } from "./actions";

interface Props {
  review: any;
}

export default function ReviewCard({ review }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      await updateReviewStatusAction(review.id, status);
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar definitivamente?")) return;
    startTransition(async () => {
      await deleteReviewAction(review.id);
    });
  };

  const hasContent = !!review.submittedAt;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm">
            {review.ownerName} & {review.petName}
          </h3>
          {review.appointment && (
            <p className="text-xs text-gray-500">
              {review.appointment.service.name} •{" "}
              {new Date(review.appointment.date).toLocaleDateString("es-CL")}
            </p>
          )}
        </div>
        {hasContent && (
          <div className="text-amber-400 text-sm">
            {"⭐".repeat(review.rating)}
          </div>
        )}
      </div>

      {hasContent ? (
        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg italic">
          &quot;{review.text}&quot;
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-2">
          Esperando respuesta...
        </p>
      )}

      {hasContent && (
        <div className="flex gap-2 mt-1">
          {review.status !== "APPROVED" && (
            <button
              onClick={() => handleStatus("APPROVED")}
              disabled={isPending}
              className="flex-1 text-xs font-semibold bg-emerald-50 text-emerald-700 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              Aprobar
            </button>
          )}
          {review.status !== "REJECTED" && (
            <button
              onClick={() => handleStatus("REJECTED")}
              disabled={isPending}
              className="flex-1 text-xs font-semibold bg-red-50 text-red-700 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              Rechazar
            </button>
          )}
        </div>
      )}

      {review.status === "REJECTED" && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-full text-xs font-medium text-gray-500 hover:text-red-600 transition-colors mt-1"
        >
          Eliminar definitivamente
        </button>
      )}
    </div>
  );
}
