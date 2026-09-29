import bcrypt from "bcryptjs";
import { jsonError, serializeUser, setSessionCookie } from "@/lib/auth";
import { ensureAdmin } from "@/lib/ensure-admin";
import { prisma } from "@/lib/prisma";
import {
  rateLimit,
  resetRateLimit,
  tooManyRequests,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INVALID_CREDENTIALS = "Correo o contraseña incorrectos.";
const MAX_BODY_BYTES = 4 * 1024;
const MAX_ATTEMPTS_PER_EMAIL = 5;
const LOCKOUT_MS = 15 * 60_000;

/** Compared against when the user doesn't exist so both paths take similar time. */
const DUMMY_HASH = bcrypt.hashSync("dona-celia-dummy-password", 10);

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return jsonError("Solicitud inválida", 413);
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return jsonError("Solicitud inválida", 400);
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonError("Ingresa tu correo y contraseña para continuar.", 400);
  }
  if (email.length > 254 || password.length > 200) {
    return jsonError(INVALID_CREDENTIALS, 401);
  }

  const attemptKey = `login-email:${email}`;
  const attempt = rateLimit(attemptKey, MAX_ATTEMPTS_PER_EMAIL, LOCKOUT_MS);
  if (!attempt.ok) {
    return tooManyRequests(attempt.retryAfterSeconds);
  }

  await ensureAdmin();

  const user = await prisma.user.findUnique({ where: { email } });
  const matches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  if (!user || !matches) {
    return jsonError(INVALID_CREDENTIALS, 401);
  }

  resetRateLimit(attemptKey);
  await setSessionCookie(user.id);

  return Response.json({
    message: "Login exitoso",
    user: serializeUser(user),
  });
}
