const GENERIC_ERROR = "Ocurrió un error inesperado. Intenta de nuevo.";

const SECRET_ENV_VARS = [
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "SESSION_SECRET",
  "ADMIN_PASSWORD",
];

/** Removes configured secrets and credential-looking fragments from text. */
export function redactSecrets(text: string) {
  let result = text;

  for (const name of SECRET_ENV_VARS) {
    const raw = process.env[name]?.trim();
    if (!raw) continue;
    const bare = raw
      .replace(new RegExp(`^(export\\s+)?${name}\\s*=\\s*`), "")
      .replace(/^["']|["']$/g, "");
    for (const value of new Set([raw, bare])) {
      if (value.length >= 6) result = result.split(value).join("[redacted]");
    }
  }

  return result
    .replace(/\b(api[_-]?key|api[_-]?secret|secret|password|token)\b(\s*[=:]\s*)\S+/gi, "$1$2[redacted]")
    .replace(/[A-Z][A-Z0-9_]*(KEY|SECRET|PASSWORD|TOKEN|URL)=\S+/g, "[redacted]")
    .replace(/\b\w+:\/\/[^\s:@/]+:[^\s@/]+@/g, "[redacted]@");
}

type HttpError = {
  status: number;
  message: string;
  expose?: boolean;
};

function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}

function logError(error: unknown) {
  const detail =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(`[api] ${redactSecrets(detail)}`);
}

/**
 * 4xx messages are user-facing validation errors. 5xx and unknown errors only
 * reach the client when explicitly marked `expose`; otherwise they are logged
 * server-side and replaced with a generic message.
 */
export function errorResponse(error: unknown) {
  if (isHttpError(error)) {
    const status = Number(error.status);
    if (status >= 400 && status < 500) {
      return Response.json({ message: String(error.message) }, { status });
    }
    if (status >= 500 && status < 600) {
      if (error.expose) {
        return Response.json(
          { message: redactSecrets(String(error.message)) },
          { status },
        );
      }
      logError(error);
      return Response.json({ message: GENERIC_ERROR }, { status });
    }
  }

  logError(error);
  return Response.json({ message: GENERIC_ERROR }, { status: 500 });
}
