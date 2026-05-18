"use client";

import { useState, useTransition } from "react";
import { updateReviewStatusAction, deleteReviewAction, resendReviewRequestAction } from "./actions";

interface Props {
  review: any;
}

export default function ReviewCard({ review }: Props) {
  const [isPending, startTransition] = useTransition();
  const [resentState, setResentState] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleStatus = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      await updateReviewStatusAction(review.id, status);
    });
  };

  const handleDelete = () => {
    const isPendingRequest = !review.submittedAt;
    const confirmMsg = isPendingRequest
      ? "¿Deseas eliminar esta solicitud de reseña pendiente? El enlace del cliente dejará de funcionar."
      : "¿Eliminar definitivamente esta reseña?";
    
    if (!confirm(confirmMsg)) return;
    
    startTransition(async () => {
      await deleteReviewAction(review.id);
    });
  };

  const handleResend = () => {
    setResentState("sending");
    startTransition(async () => {
      try {
        await resendReviewRequestAction(review.id);
        setResentState("success");
        setTimeout(() => setResentState("idle"), 4000);
      } catch (err: any) {
        setResentState("error");
        alert(err.message || "Error al reenviar el correo.");
        setTimeout(() => setResentState("idle"), 4000);
      }
    });
  };

  const hasContent = !!review.submittedAt;
  const ownerEmail = review.appointment?.dog?.owner?.email;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm truncate">
            {review.ownerName} & {review.petName}
          </h3>
          {review.appointment && (
            <p className="text-xs text-gray-500">
              {review.appointment.service.name} •{" "}
              {new Date(review.appointment.date).toLocaleDateString("es-CL")}
            </p>
          )}
          {/* Mostrar Correo de Envío para Reseñas Pendientes */}
          {!hasContent && (
            <div className="mt-1">
              {ownerEmail ? (
                <p className="text-[10px] text-gray-400 truncate max-w-full" title={ownerEmail}>
                  ✉️ {ownerEmail}
                </p>
              ) : (
                <p className="text-[10px] text-red-400 font-medium">
                  ⚠️ Sin correo electrónico
                </p>
              )}
            </div>
          )}
        </div>
        {hasContent && (
          <div className="text-amber-400 text-sm flex-shrink-0 ml-2">
            {"★".repeat(review.rating)}
          </div>
        )}
      </div>

      {hasContent ? (
        <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg italic border border-gray-100">
          &quot;{review.text}&quot;
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic text-center py-1">
          Esperando respuesta del cliente...
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

      {/* Botones para Solicitudes en Espera */}
      {!hasContent && (
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-dashed border-gray-100">
          <button
            onClick={handleResend}
            disabled={isPending || resentState === "sending" || !ownerEmail}
            className={`w-full text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border ${
              resentState === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : resentState === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : !ownerEmail
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80"
            }`}
          >
            {resentState === "sending" ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-amber-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Enviando...</span>
              </>
            ) : resentState === "success" ? (
              <span>✓ ¡Reenviado con éxito!</span>
            ) : resentState === "error" ? (
              <span>⚠️ Error al enviar</span>
            ) : (
              <>
                <span>✉️</span> Reenviar Email
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="w-full text-xs font-semibold bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-700 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>🗑️</span> Eliminar Solicitud
          </button>
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
