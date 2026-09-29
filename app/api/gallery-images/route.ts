import { requireAuth } from "@/lib/auth";
import {
  createGalleryImage,
  listGalleryImages,
  readGalleryImageFields,
} from "@/lib/gallery-images";
import { errorResponse } from "@/lib/http";
import { deleteGalleryImageFile, saveGalleryImage } from "@/lib/images";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const categoryId =
    new URL(request.url).searchParams.get("category") ?? undefined;

  return Response.json({
    message: "Imágenes de galería obtenidas con éxito",
    images: await listGalleryImages(categoryId || undefined),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  let uploadedImage = "";
  try {
    const formData = await request.formData();
    const fields = readGalleryImageFields(formData);
    const imageFile = formData.get("image");

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      throw Object.assign(new Error("La imagen es requerida"), { status: 400 });
    }

    if (!fields.title || !fields.categoryId) {
      throw Object.assign(
        new Error("Completa título y categoría para continuar."),
        { status: 400 },
      );
    }

    uploadedImage = await saveGalleryImage(imageFile);

    const image = await createGalleryImage({
      title: fields.title,
      description: fields.description,
      location: fields.location,
      categoryId: fields.categoryId,
      isFeatured: fields.isFeatured,
      image: uploadedImage,
    });

    return Response.json(
      { message: "Imagen agregada con éxito", image },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedImage) {
      await deleteGalleryImageFile(uploadedImage);
    }
    return errorResponse(error);
  }
}
