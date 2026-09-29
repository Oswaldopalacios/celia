import { requireAuth } from "@/lib/auth";
import {
  createGalleryCategory,
  listGalleryCategories,
} from "@/lib/gallery-categories";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    message: "Categorías de galería obtenidas con éxito",
    categories: await listGalleryCategories(),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { title?: string };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return Response.json({ message: "El título es requerido" }, { status: 400 });
    }

    const category = await createGalleryCategory(title);
    return Response.json(
      { message: "Categoría creada con éxito", category },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
