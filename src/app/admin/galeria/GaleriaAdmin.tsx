"use client";

import Image from "next/image";
import { useActionState, useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createGalleryPhotoAction,
  deleteGalleryPhotoAction,
  togglePhotoVisibilityAction,
  updatePhotoOrderAction,
  type CreatePhotoState,
} from "./actions";

interface GalleryPhoto {
  id: string;
  photoUrl: string;
  caption: string | null;
  order: number;
  isVisible: boolean;
}

interface Props {
  initialPhotos: GalleryPhoto[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
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
    <div className="flex flex-col gap-2 w-full">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ps-text-mid)" }}>
        {label}
      </span>
      <label
        className="relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:border-[var(--primary)] w-full max-w-sm"
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
          <div className="flex flex-col items-center p-6 text-center">
            <span className="text-4xl mb-2">{uploading ? "⏳" : "📸"}</span>
            <span className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
              {uploading ? "Subiendo a la nube..." : "Haz clic para subir foto del resultado"}
            </span>
            <span className="text-xs mt-1" style={{ color: "var(--ps-text-mid)" }}>
              Formatos recomendados: JPG, PNG · Máx. 4MB
            </span>
          </div>
        )}
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function GaleriaAdmin({
  initialPhotos,
  currentPage,
  totalPages,
  totalCount,
}: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Sincronizar cambios desde el servidor (ej: revalidatePath)
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      router.push(`/admin/galeria?page=${newPage}`);
    });
  };


  // --- Upload state ---
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const initialState: CreatePhotoState = {};
  const [formState, formAction, isCreating] = useActionState(
    createGalleryPhotoAction,
    initialState,
  );

  useEffect(() => {
    if (formState.success) {
      setPhotoUrl(null);
      setUploadError(null);
      formRef.current?.reset();
    }
  }, [formState.success]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Error al subir foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteGalleryPhotoAction(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    });
  };

  const handleToggleVisibility = (id: string, current: boolean) => {
    startTransition(async () => {
      await togglePhotoVisibilityAction(id, !current);
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isVisible: !current } : p)),
      );
    });
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const newPhotos = [...photos];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= newPhotos.length) return;

    // Intercambiar orden en BD
    const tempOrder = newPhotos[index].order;
    newPhotos[index] = { ...newPhotos[index], order: newPhotos[swapIndex].order };
    newPhotos[swapIndex] = { ...newPhotos[swapIndex], order: tempOrder };

    // Intercambiar posición en array local
    [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];
    setPhotos(newPhotos);

    startTransition(async () => {
      await updatePhotoOrderAction(
        newPhotos.map((p) => ({ id: p.id, order: p.order })),
      );
    });
  };

  const canSubmit = !!photoUrl && !isCreating && !uploading;

  return (
    <div className="space-y-10 relative">
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--ps-lila)] animate-pulse z-50" />
      )}
      {/* ------------------------------------------------------------------ */}
      {/* Formulario de Subida                                                */}

      {/* ------------------------------------------------------------------ */}
      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{ borderColor: "var(--ps-lila-light)", backgroundColor: "white" }}
      >
        <h2 className="text-base font-semibold" style={{ color: "var(--ps-text)" }}>
          Agregar nueva foto a la galería
        </h2>

        <form
          ref={formRef}
          action={(fd) => {
            if (!photoUrl) return;
            fd.set("photoUrl", photoUrl);
            formAction(fd);
          }}
          className="space-y-5"
        >
          <input type="hidden" name="photoUrl" value={photoUrl ?? ""} readOnly />

          <div className="max-w-md">
            <PhotoUploadButton
              label="Foto del resultado"
              previewUrl={photoUrl}
              uploading={uploading}
              onFileSelected={handleUpload}
            />
          </div>

          <div className="max-w-md space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ps-text-mid)" }}>
              Descripción o Raza (opcional)
            </label>
            <input
              name="caption"
              type="text"
              placeholder="Ej: Caniche Toy - Corte higiénico y pompón"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)]"
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
            {isCreating ? "Publicando…" : "Publicar foto"}
          </button>
        </form>

        {formState.success && !photoUrl && (
          <p className="text-emerald-600 text-sm font-medium">
            ✅ Foto publicada correctamente en la galería pública.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Listado de Fotos                                                   */}
      {/* ------------------------------------------------------------------ */}
      {photos.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed py-16 text-center"
          style={{ borderColor: "var(--ps-lila-light)" }}
        >
          <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>
            Aún no hay fotos en la galería. ¡Sube la primera foto arriba!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="rounded-2xl border overflow-hidden flex flex-col justify-between"
              style={{
                borderColor: "var(--ps-lila-light)",
                backgroundColor: "white",
                opacity: photo.isVisible ? 1 : 0.6,
              }}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] w-full bg-gray-50 border-b">
                <Image
                  src={photo.photoUrl}
                  alt={photo.caption ?? "Foto de peluquería"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {!photo.isVisible && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                      Oculta en Landing
                    </span>
                  </div>
                )}
              </div>

              {/* Info & Admin Controls */}
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: "var(--ps-text)" }}>
                    {photo.caption || <span className="italic text-gray-400 text-xs">Sin descripción</span>}
                  </p>
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0"
                    style={
                      photo.isVisible
                        ? { backgroundColor: "#d1fae5", color: "#065f46" }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {photo.isVisible ? "Visible" : "Oculta"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t pt-3 mt-1">
                  {/* Reordering */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0 || isPending}
                      className="p-1.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      title="Mover arriba"
                    >
                      ⬆️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === photos.length - 1 || isPending}
                      className="p-1.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      title="Mover abajo"
                    >
                      ⬇️
                    </button>
                  </div>

                  {/* Visual controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(photo.id, photo.isVisible)}
                      disabled={isPending}
                      className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors"
                      style={
                        photo.isVisible
                          ? { backgroundColor: "var(--ps-lila-pale)", color: "var(--ps-lila)" }
                          : { backgroundColor: "#e0e7ff", color: "#3730a3" }
                      }
                    >
                      {photo.isVisible ? "Ocultar" : "Mostrar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(photo.id)}
                      disabled={isPending}
                      className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6"
          style={{ borderColor: "var(--ps-lila-light)" }}
        >
          <span className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
            Mostrando fotos del {Math.min((currentPage - 1) * 12 + 1, totalCount)} al {Math.min(currentPage * 12, totalCount)} de un total de {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 hover:bg-gray-50"
              style={{ borderColor: "var(--ps-lila-light)", color: "var(--ps-text)" }}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                disabled={isPending}
                className="w-8 h-8 rounded-full border text-xs font-semibold transition-colors"
                style={
                  p === currentPage
                    ? { backgroundColor: "var(--ps-lila)", color: "white", borderColor: "var(--ps-lila)" }
                    : { borderColor: "var(--ps-lila-light)", color: "var(--ps-text)", backgroundColor: "white" }
                }
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 hover:bg-gray-50"
              style={{ borderColor: "var(--ps-lila-light)", color: "var(--ps-text)" }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Eliminar foto?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta acción no se puede deshacer. La foto desaparecerá de la galería pública.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

