"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  createGalleryPairAction,
  deleteGalleryPairAction,
  toggleVisibilityAction,
  updateOrderAction,
  type CreateState,
} from "./actions";

interface GalleryPair {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  breed: string | null;
  order: number;
  isVisible: boolean;
}

interface Props {
  initialPairs: GalleryPair[];
}

// ---------------------------------------------------------------------------
// Cloudinary upload helper
// ---------------------------------------------------------------------------
async function uploadToCloudinary(file: File): Promise<string> {
  const sigRes = await fetch("/api/admin/upload-signature");
  if (!sigRes.ok) throw new Error("No se pudo obtener la firma de Cloudinary");
  const { signature, timestamp, apiKey, cloudName, folder } =
    (await sigRes.json()) as {
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    };

  const fd = new FormData();
  fd.append("file", file);
  fd.append("signature", signature);
  fd.append("timestamp", String(timestamp));
  fd.append("api_key", apiKey);
  fd.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd },
  );
  if (!uploadRes.ok) throw new Error("Error al subir a Cloudinary");
  const data = (await uploadRes.json()) as { secure_url: string };
  return data.secure_url;
}

// ---------------------------------------------------------------------------
// PhotoUploadButton
// ---------------------------------------------------------------------------
function PhotoUploadButton({
  label,
  previewUrl,
  uploading,
  onFileSelected,
}: {
  label: string;
  previewUrl: string | null;
  uploading: boolean;
  onFileSelected: (file: File) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ps-text-mid)" }}>
        {label}
      </span>
      <label
        className="relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:border-[var(--primary)]"
        style={{ borderColor: "var(--ps-lila-light)", backgroundColor: "var(--ps-lila-pale)" }}
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelected(f);
          }}
        />
        {previewUrl ? (
          <Image src={previewUrl} alt={label} fill className="object-cover" />
        ) : (
          <>
            <span className="text-3xl">{uploading ? "⏳" : "📷"}</span>
            <span className="text-xs mt-1" style={{ color: "var(--ps-text-mid)" }}>
              {uploading ? "Subiendo…" : "Elegir foto"}
            </span>
          </>
        )}
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function GaleriaAdmin({ initialPairs }: Props) {
  const [pairs, setPairs] = useState<GalleryPair[]>(initialPairs);
  const [isPending, startTransition] = useTransition();

  // --- Upload state ---
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Form action ---
  const initialState: CreateState = {};
  const [formState, formAction, isCreating] = useActionState(
    createGalleryPairAction,
    initialState,
  );

  const handleUploadBefore = async (file: File) => {
    setUploadingBefore(true);
    setUploadError(null);
    try {
      const url = await uploadToCloudinary(file);
      setBeforeUrl(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Error al subir foto");
    } finally {
      setUploadingBefore(false);
    }
  };

  const handleUploadAfter = async (file: File) => {
    setUploadingAfter(true);
    setUploadError(null);
    try {
      const url = await uploadToCloudinary(file);
      setAfterUrl(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Error al subir foto");
    } finally {
      setUploadingAfter(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Eliminar este par de fotos de la galería?")) return;
    startTransition(async () => {
      await deleteGalleryPairAction(id);
      setPairs((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const handleToggleVisibility = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleVisibilityAction(id, !current);
      setPairs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isVisible: !current } : p)),
      );
    });
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const newPairs = [...pairs];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= newPairs.length) return;

    // Swap order values
    const tempOrder = newPairs[index].order;
    newPairs[index] = { ...newPairs[index], order: newPairs[swapIndex].order };
    newPairs[swapIndex] = { ...newPairs[swapIndex], order: tempOrder };

    // Swap positions in array
    [newPairs[index], newPairs[swapIndex]] = [newPairs[swapIndex], newPairs[index]];
    setPairs(newPairs);

    startTransition(async () => {
      await updateOrderAction(
        newPairs.map((p) => ({ id: p.id, order: p.order })),
      );
    });
  };

  const canSubmit = !!beforeUrl && !!afterUrl && !isCreating && !uploadingBefore && !uploadingAfter;

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* Upload form                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ borderColor: "var(--ps-lila-light)", backgroundColor: "white" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--ps-text)" }}>
          Agregar nuevo par de fotos
        </h2>

        <form
          action={(fd) => {
            if (!beforeUrl || !afterUrl) return;
            fd.set("beforeUrl", beforeUrl);
            fd.set("afterUrl", afterUrl);
            formAction(fd);
            // Reset on success handled below via formState
          }}
          className="space-y-5"
        >
          <input type="hidden" name="beforeUrl" value={beforeUrl ?? ""} readOnly />
          <input type="hidden" name="afterUrl" value={afterUrl ?? ""} readOnly />

          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <PhotoUploadButton
              label="📷 Antes"
              previewUrl={beforeUrl}
              uploading={uploadingBefore}
              onFileSelected={handleUploadBefore}
            />
            <PhotoUploadButton
              label="✨ Después"
              previewUrl={afterUrl}
              uploading={uploadingAfter}
              onFileSelected={handleUploadAfter}
            />
          </div>

          <div className="max-w-xs space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ps-text-mid)" }}>
              Etiqueta (raza del perro, opcional)
            </label>
            <input
              name="breed"
              type="text"
              placeholder="Ej: Golden Retriever"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
            />
          </div>

          {uploadError && (
            <p className="text-red-500 text-xs">{uploadError}</p>
          )}
          {formState.errors?._form && (
            <p className="text-red-500 text-xs">{formState.errors._form[0]}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {isCreating ? "Publicando…" : "Publicar en galería"}
          </button>
        </form>

        {formState.success && (
          <p className="text-emerald-600 text-sm font-medium">
            ✅ Par publicado. Recarga la página para seguir agregando.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pairs list                                                           */}
      {/* ------------------------------------------------------------------ */}
      {pairs.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: "var(--ps-lila-light)" }}
        >
          <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
            Aún no hay fotos en la galería. ¡Agrega el primer par arriba!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pairs.map((pair, idx) => (
            <div
              key={pair.id}
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--ps-lila-light)",
                backgroundColor: "white",
                opacity: pair.isVisible ? 1 : 0.6,
              }}
            >
              {/* Images */}
              <div className="grid grid-cols-2">
                <div className="relative aspect-square">
                  <Image
                    src={pair.beforeUrl}
                    alt="Antes"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span className="absolute top-2 left-2 text-xs font-bold bg-black/50 text-white rounded-full px-2 py-0.5">
                    Antes
                  </span>
                </div>
                <div className="relative aspect-square">
                  <Image
                    src={pair.afterUrl}
                    alt="Después"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span className="absolute top-2 left-2 text-xs font-bold bg-black/50 text-white rounded-full px-2 py-0.5">
                    Después
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  {pair.breed && (
                    <span className="text-sm font-medium truncate" style={{ color: "var(--ps-text)" }}>
                      {pair.breed}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={
                      pair.isVisible
                        ? { backgroundColor: "#d1fae5", color: "#065f46" }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {pair.isVisible ? "Visible" : "Oculto"}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Order buttons */}
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0 || isPending}
                    className="p-1.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="Subir"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === pairs.length - 1 || isPending}
                    className="p-1.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    title="Bajar"
                  >
                    ⬇️
                  </button>

                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(pair.id, pair.isVisible)}
                    disabled={isPending}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={
                      pair.isVisible
                        ? { backgroundColor: "#fef3c7", color: "#92400e" }
                        : { backgroundColor: "#d1fae5", color: "#065f46" }
                    }
                  >
                    {pair.isVisible ? "Ocultar" : "Mostrar"}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(pair.id)}
                    disabled={isPending}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
