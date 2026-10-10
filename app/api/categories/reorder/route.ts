import { requireAuth } from "@/lib/auth";
import { reorderCategories } from "@/lib/categories";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string => typeof id === "string" && id.trim() !== "")
      : [];

    const categories = await reorderCategories(ids.map((id) => id.trim()));
    return Response.json({
      message: "Orden del menú actualizado",
      categories,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
