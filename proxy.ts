import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const MINUTE = 60_000;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isCrossOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

function limitApi(request: NextRequest, pathname: string) {
  const ip = clientIp(request);
  const mutating = MUTATING_METHODS.has(request.method);

  if (mutating && isCrossOrigin(request)) {
    return Response.json({ message: "Origen no permitido" }, { status: 403 });
  }

  if (pathname === "/auth/login") {
    const result = rateLimit(`login:${ip}`, 10, 15 * MINUTE);
    return result.ok ? null : tooManyRequests(result.retryAfterSeconds);
  }

  const result = mutating
    ? rateLimit(`api-write:${ip}`, 60, MINUTE)
    : rateLimit(`api-read:${ip}`, 180, MINUTE);
  return result.ok ? null : tooManyRequests(result.retryAfterSeconds);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return limitApi(request, pathname) ?? NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await verifySessionToken(token) : null;
  const isAuthed = Boolean(userId);

  if (pathname.startsWith("/dashboard") && !isAuthed) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/api/:path*",
    "/auth/:path*",
  ],
};
