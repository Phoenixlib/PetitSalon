"use client";

import { useState } from "react";

interface UploadResult {
  secureUrl: string;
  publicId: string;
}

interface UseCloudinaryUploadReturn {
  uploading: boolean;
  uploadFiles: (files: File[]) => Promise<UploadResult[]>;
  error: string | null;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    setError(null);

    try {
      // 1. Obtener firma del servidor
      const sigRes = await fetch("/api/admin/upload-signature");
      if (!sigRes.ok) throw new Error("No se pudo obtener la firma de subida");
      const { signature, timestamp, apiKey, cloudName, folder } =
        await sigRes.json();

      // 2. Subir cada archivo a Cloudinary directamente desde el browser
      const results: UploadResult[] = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", String(timestamp));
          formData.append("signature", signature);
          formData.append("folder", folder);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: formData },
          );

          if (!res.ok) throw new Error(`Error subiendo ${file.name}`);
          const data = await res.json();

          return {
            secureUrl: data.secure_url as string,
            publicId: data.public_id as string,
          };
        }),
      );

      return results;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al subir imágenes";
      setError(msg);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadFiles, error };
}
