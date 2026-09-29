import bcrypt from "bcryptjs";
import { jsonError, serializeUser, setSessionCookie } from "@/lib/auth";
import { ensureAdmin } from "@/lib/ensure-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureAdmin();

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return jsonError("Solicitud inválida", 400);
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return jsonError("Ingresa tu correo y contraseña para continuar.", 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return jsonError("El usuario no existe", 404);
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    return jsonError("Contraseña incorrecta", 401);
  }

  await setSessionCookie(user.id);

  return Response.json({
    message: "Login exitoso",
    user: serializeUser(user),
  });
}
