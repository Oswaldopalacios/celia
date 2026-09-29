import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await clearSessionCookie();
  return Response.json({ message: "Sesión cerrada correctamente" });
}
