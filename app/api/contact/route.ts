import { requireAuth } from "@/lib/auth";
import {
  getContactSettings,
  updateContactSettings,
} from "@/lib/contact-settings";
import { errorResponse } from "@/lib/http";
import type { ContactSettingsInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STRING_FIELDS = [
  "phone",
  "whatsapp",
  "email",
  "name",
  "place",
  "address",
  "mapsQuery",
  "description",
] as const;

export async function GET() {
  return Response.json({
    message: "Contacto obtenido con éxito",
    contact: await getContactSettings(),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input: Partial<ContactSettingsInput> = {};

    for (const field of STRING_FIELDS) {
      if (typeof body[field] === "string") input[field] = body[field];
    }
    if (Array.isArray(body.hours)) {
      input.hours = body.hours as ContactSettingsInput["hours"];
    }
    if (Array.isArray(body.references)) {
      input.references = body.references as ContactSettingsInput["references"];
    }

    const contact = await updateContactSettings(input);

    return Response.json({
      message: "Contacto actualizado con éxito",
      contact,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
