"use client";

import { useEffect, useActionState, useState, useRef } from "react";
import { updateDogAction, DogFormState } from "@/app/admin/perros/actions";
import { motion } from "framer-motion";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

export default function DogModal({
  dog,
  isOpen,
  onClose,
}: {
  dog: {
    id: string;
    name: string;
    breed: string;
    age: string | null;
    weight: string | null;
    notes: string | null;
    photo: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}) {
  const { uploading, uploadFiles, error: uploadError } = useCloudinaryUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(dog.photo);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar el estado al abrir o cuando cambia la foto de la mascota
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(dog.photo);
      setSelectedFile(null);
      setPhotoRemoved(false);
    }
  }, [dog.photo, isOpen]);

  // Limpiar URL de blob temporal cuando se desmonta o cambia el preview
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const [state, formAction, pending] = useActionState<DogFormState, FormData>(
    async (prevState, formData) => {
      let finalPhotoUrl = previewUrl;

      if (selectedFile) {
        const uploaded = await uploadFiles([selectedFile]);
        if (uploaded && uploaded.length > 0) {
          finalPhotoUrl = uploaded[0].secureUrl;
        } else {
          return {
            errors: {
              _form: ["Error al subir la foto de la mascota a Cloudinary."],
            },
          };
        }
      } else if (photoRemoved) {
        finalPhotoUrl = null;
      }

      if (finalPhotoUrl) {
        formData.set("photo", finalPhotoUrl);
      } else {
        formData.set("photo", "");
      }

      return updateDogAction(dog.id, prevState, formData);
    },
    {}
  );

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotoRemoved(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isSubmitting = pending || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ backgroundColor: "var(--ps-lila-pale)", borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>Editar Mascota</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5 transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Nombre *</label>
                <input name="name" type="text" defaultValue={dog.name} required className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
                {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Raza *</label>
                <input name="breed" type="text" defaultValue={dog.breed} required className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
                {state.errors?.breed && <p className="text-xs text-red-500">{state.errors.breed[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Edad</label>
                <input name="age" type="text" defaultValue={dog.age || ""} placeholder="ej. 2 años" className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Peso</label>
                <input name="weight" type="text" defaultValue={dog.weight || ""} placeholder="ej. 5 kg" className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>Notas / Observaciones</label>
              <textarea name="notes" defaultValue={dog.notes || ""} rows={3} className="w-full rounded-lg px-4 py-2 border focus:ring-2 focus:ring-[var(--primary)]" style={{ borderColor: "var(--border)" }}></textarea>
            </div>

            {/* Zona de Foto de Mascota */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium" style={{ color: "var(--ps-text-mid)" }}>
                Foto de la Mascota
              </label>

              {previewUrl ? (
                <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-neutral-200 shadow-sm mx-auto group">
                  <img
                    src={previewUrl}
                    alt="Vista previa de la mascota"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold hover:bg-red-600 shadow-md transition-all active:scale-90 disabled:opacity-50"
                    aria-label="Eliminar foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border-2 border-dashed py-6 flex flex-col items-center gap-2 transition-all hover:bg-gray-50 active:scale-[0.99] disabled:opacity-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-2xl">🐶</span>
                  <span className="text-sm font-medium" style={{ color: "var(--ps-text)" }}>
                    Subir foto de la mascota
                  </span>
                  <span className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
                    JPG, PNG, WEBP · Máx. 10 MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />

              {uploading && (
                <p className="text-sm text-center py-1" style={{ color: "var(--ps-text-mid)" }}>
                  Subiendo foto a Cloudinary…
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500 text-center">{uploadError}</p>
              )}
            </div>

            {state.errors?._form && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.errors._form[0]}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t mt-6" style={{ borderColor: "var(--border)" }}>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 disabled:opacity-50" style={{ color: "var(--ps-text-mid)" }}>Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-full text-sm font-bold text-white bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 transition-opacity">
                {uploading ? "Subiendo..." : pending ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
