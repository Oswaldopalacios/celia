import { requireAuth } from "@/lib/auth";
import {
  getGalleryImageById,
  readGalleryImageFields,
  removeGalleryImage,
  updateGalleryImage,
} from "@/lib/gallery-images";
import { errorResponse } from "@/lib/http";
import { deleteGalleryImageFile, saveGalleryImage } from "@/lib/images";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const image = await getGalleryImageById(id);
  if (!image) {
    return Response.json({ message: "Imagen no encontrada" }, { status: 404 });
  }
  return Response.json({ message: "Imagen obtenida con éxito", image });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  let uploadedImage: string | undefined;

  try {
    const formData = await request.formData();
    const fields = readGalleryImageFields(formData, true);
    const imageFile = formData.get("image");
    const current = await getGalleryImageById(id);

    if (!current) {
      return Response.json({ message: "Imagen no encontrada" }, { status: 404 });
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      uploadedImage = await saveGalleryImage(imageFile);
    }

    const image = await updateGalleryImage(id, {
      title: fields.title,
      description: fields.description,
      location: fields.location,
      categoryId: fields.categoryId,
      isFeatured: fields.isFeatured,
      image: uploadedImage,
    });

    if (uploadedImage && current.image) {
      await deleteGalleryImageFile(current.image);
    }

    return Response.json({
      message: "Imagen actualizada con éxito",
      image,
    });
  } catch (error) {
    if (uploadedImage) {
      await deleteGalleryImageFile(uploadedImage);
    }
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    await removeGalleryImage(id);
    return Response.json({ message: "Imagen eliminada con éxito" });
  } catch (error) {
    return errorResponse(error);
  }
}
