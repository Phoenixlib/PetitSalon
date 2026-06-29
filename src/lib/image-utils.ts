/**
 * Utilidades compartidas para optimización de imágenes en cliente y URLs de Cloudinary.
 */

/**
 * Comprime una imagen en el cliente usando HTML5 Canvas antes de subirla.
 * Redimensiona si excede las dimensiones máximas y aplica compresión JPEG/WebP.
 */
export function compressImageClient(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.80,
): Promise<File> {
  return new Promise((resolve) => {
    // Si no es imagen o es un GIF animado, no alterar
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar manteniendo proporción si excede límites
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Failsafe
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG para asegurar compresión constante
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            
            // Reemplazar la extensión original por .jpg
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], newName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Inserta parámetros de optimización dinámica en una URL de Cloudinary.
 * Automáticamente añade f_auto y q_auto, más opciones de tamaño.
 */
export function getOptimizedCloudinaryUrl(url: string, width?: number, height?: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  
  const params = ["f_auto", "q_auto"];
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  params.push("c_limit");
  
  const transformString = params.join(",");
  
  // Reemplazar /upload/ asegurando que añadimos los parámetros
  return url.replace("/upload/", `/upload/${transformString}/`);
}
