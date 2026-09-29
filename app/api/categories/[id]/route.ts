import { requireAuth } from "@/lib/auth";
import { deleteCategory, updateCategory } from "@/lib/categories";
import { errorResponse } from "@/lib/http";
import { resolveProductType } from "@/lib/mappers";
import type { ProductType } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      title?: string;
      kind?: ProductType;
      icon?: string;
    };

    const category = await updateCategory(id, {
      title: body.title,
      kind: body.kind ? resolveProductType(body.kind) : undefined,
      icon: typeof body.icon === "string" ? body.icon : undefined,
    });

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
    let reassignTo = "";
    try {
      const body = (await request.json()) as { reassignTo?: string };
      reassignTo =
        typeof body.reassignTo === "string" ? body.reassignTo.trim() : "";
    } catch {
      reassignTo = "";
    }

    const result = await deleteCategory(id, reassignTo || undefined);
    return Response.json({
      message:
        result.reassignedCount > 0
          ? `Categoría eliminada. Se reasignaron ${result.reassignedCount} producto${result.reassignedCount === 1 ? "" : "s"}.`
          : "Categoría eliminada con éxito",
      reassignedCount: result.reassignedCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
