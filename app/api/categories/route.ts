import { requireAuth } from "@/lib/auth";
import { createCategory, listCategories } from "@/lib/categories";
import { errorResponse } from "@/lib/http";
import { resolveProductType } from "@/lib/mappers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind =
    kindParam === "comida" || kindParam === "bebidas" ? kindParam : undefined;

  return Response.json({
    message: "Categorías obtenidas con éxito",
    categories: await listCategories(kind),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      title?: string;
      kind?: string;
      icon?: string;
    };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const kind = resolveProductType(body.kind);
    const icon = typeof body.icon === "string" ? body.icon : undefined;

    if (!title) {
      return Response.json({ message: "El título es requerido" }, { status: 400 });
    }

    const category = await createCategory(title, kind, icon);
    return Response.json(
      { message: "Categoria creada con exito", category },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
