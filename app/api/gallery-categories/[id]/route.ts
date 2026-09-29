import { requireAuth } from "@/lib/auth";
import {
  deleteGalleryCategory,
  getGalleryCategoryById,
  updateGalleryCategory,
} from "@/lib/gallery-categories";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const category = await getGalleryCategoryById(id);
  if (!category) {
    return Response.json({ message: "Categoría no encontrada" }, { status: 404 });
  }
  return Response.json({ message: "Categoría obtenida con éxito", category });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { title?: string };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return Response.json({ message: "El título es requerido" }, { status: 400 });
    }

    const category = await updateGalleryCategory(id, title);
    return Response.json({
      message: "Categoría actualizada con éxito",
      category,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    let reassignTo: string | undefined;
    try {
      const body = (await request.json()) as { reassignTo?: string };
      reassignTo =
        typeof body.reassignTo === "string" ? body.reassignTo : undefined;
    } catch {
      reassignTo = undefined;
    }

    const result = await deleteGalleryCategory(id, reassignTo);
    return Response.json({
      message: "Categoría eliminada con éxito",
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
