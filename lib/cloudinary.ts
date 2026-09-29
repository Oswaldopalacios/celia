import { v2 as cloudinary } from "cloudinary";

let configured = false;

type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

/**
 * Reads an env var tolerating common copy/paste mistakes from hosting
 * dashboards: surrounding quotes and a pasted `NAME=` prefix.
 */
function readEnv(name: string) {
  let value = process.env[name]?.trim();
  if (!value) return undefined;

  const prefix = new RegExp(`^(export\\s+)?${name}\\s*=\\s*`);
  if (prefix.test(value)) {
    console.warn(
      `[cloudinary] ${name} incluye el prefijo "${name}=" en su valor; se ignoró. Corrige la variable en tu hosting.`,
    );
    value = value.replace(prefix, "");
  }

  return value.replace(/^["']|["']$/g, "").trim() || undefined;
}

function fromUrl(): CloudinaryCredentials | null {
  const raw = readEnv("CLOUDINARY_URL");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "cloudinary:") return null;
    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password),
    };
  } catch {
    return null;
  }
}

function configError(detail: string) {
  console.error(`[cloudinary] Configuración inválida: ${detail}`);
  return Object.assign(
    new Error("El servicio de imágenes no está configurado correctamente."),
    { status: 500, expose: true },
  );
}

function readCredentials(): CloudinaryCredentials {
  const credentials = fromUrl() ?? {
    cloudName: readEnv("CLOUDINARY_CLOUD_NAME") ?? "",
    apiKey: readEnv("CLOUDINARY_API_KEY") ?? "",
    apiSecret: readEnv("CLOUDINARY_API_SECRET") ?? "",
  };

  if (!credentials.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    throw configError(
      "faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET",
    );
  }
  if (!/^[a-z0-9_-]+$/i.test(credentials.cloudName)) {
    throw configError("CLOUDINARY_CLOUD_NAME tiene caracteres inválidos");
  }
  if (!/^\d+$/.test(credentials.apiKey)) {
    throw configError("CLOUDINARY_API_KEY debe contener solo dígitos");
  }
  if (!/^[\w-]+$/.test(credentials.apiSecret)) {
    throw configError("CLOUDINARY_API_SECRET tiene caracteres inválidos");
  }

  return credentials;
}

export function getCloudinary() {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } = readCredentials();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    configured = true;
  }

  return cloudinary;
}
