import { getSessionUser, jsonError } from "@/lib/auth";
import { ensureAdmin } from "@/lib/ensure-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await ensureAdmin();
  const user = await getSessionUser();
  if (!user) {
    return jsonError("No autenticado", 401);
  }
  return Response.json(user);
}
