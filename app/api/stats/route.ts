import { getSessionUser, jsonError } from "@/lib/auth";
import { getCatalogStats } from "@/lib/products";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("No autenticado", 401);
  }

  return Response.json({
    message: "Estadísticas obtenidas con éxito",
    stats: await getCatalogStats(),
  });
}
