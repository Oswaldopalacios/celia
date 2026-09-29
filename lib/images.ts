import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { getCloudinary } from "@/lib/cloudinary";
import { redactSecrets } from "@/lib/http";

const PRODUCT_FOLDER = "dona-celia/products";
const GALLERY_FOLDER = "dona-celia/gallery";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_BYTES = 5 * 1024 * 1024;

async function uploadImage(file: File, folder: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw Object.assign(
      new Error("Solo se permiten imágenes jpg, jpeg, png o webp"),
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    throw Object.assign(new Error("La imagen no puede superar los 5 MB"), {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const cloudinary = getCloudinary();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (
        error: UploadApiErrorResponse | undefined,
        uploaded: UploadApiResponse | undefined,
      ) => {
        if (error || !uploaded) {
          console.error(
            `[cloudinary] Falló la subida (http ${error?.http_code ?? "?"}): ${redactSecrets(error?.message ?? "sin respuesta")}`,
          );
          reject(
            Object.assign(
              new Error(
                "No se pudo subir la imagen. Intenta de nuevo en unos minutos.",
              ),
              { status: 502, expose: true },
            ),
          );
          return;
        }
        resolve(uploaded);
      },
    );

    stream.end(buffer);
  });

  return result.secure_url;
}

export async function saveProductImage(file: File) {
  return uploadImage(file, PRODUCT_FOLDER);
}

export async function saveGalleryImage(file: File) {
  return uploadImage(file, GALLERY_FOLDER);
}

function getPublicIdFromUrl(imageUrl: string): string | null {
  try {
    const pathname = new URL(imageUrl).pathname;
    const uploadMarker = "/upload/";
    const uploadIndex = pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    let publicPath = pathname.slice(uploadIndex + uploadMarker.length);
    publicPath = publicPath.replace(/^v\d+\//, "");
    publicPath = publicPath.replace(/\.[^.]+$/, "");
    return decodeURIComponent(publicPath) || null;
  } catch {
    return null;
  }
}

async function destroyImage(imageUrl?: string | null) {
  if (!imageUrl) return;
  if (!imageUrl.startsWith("http")) return;

  const publicId = getPublicIdFromUrl(imageUrl);
  if (!publicId) return;

  try {
    await getCloudinary().uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    // No bloquear el CRUD si Cloudinary no encuentra el asset.
    console.warn(
      `[cloudinary] No se pudo borrar la imagen: ${redactSecrets(error instanceof Error ? error.message : String(error))}`,
    );
  }
}

export async function deleteProductImage(imageUrl?: string | null) {
  return destroyImage(imageUrl);
}

export async function deleteGalleryImageFile(imageUrl?: string | null) {
  return destroyImage(imageUrl);
}
