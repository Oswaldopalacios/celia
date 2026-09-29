import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "donacelia_session";
export const SESSION_DAYS = 7;

function getSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET debe tener al menos 16 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
