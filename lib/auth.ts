import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  sessionCookieOptions,
  signSession,
  verifySessionToken,
} from "@/lib/session";
import type { User } from "@/lib/types";

export { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function setSessionCookie(userId: string) {
  const token = await signSession(userId);
  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(60 * 60 * 24 * SESSION_DAYS),
  );
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: "admin" | "operator";
};

export function serializeUser(row: UserRow): User {
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    userType: row.userType,
  };
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userType: true,
    },
  });

  return row ? serializeUser(row) : null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, response: jsonError("No autenticado", 401) };
  }
  return { ok: true as const, user };
}

export function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}
