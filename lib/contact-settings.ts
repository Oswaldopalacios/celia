import { ensureDefaults } from "@/lib/bootstrap";
import { DEFAULT_LOCATION, isReferenceIcon } from "@/lib/location";
import { nowIso, prisma } from "@/lib/prisma";
import type {
  ContactSettings,
  ContactSettingsInput,
  LocationHour,
  LocationReference,
} from "@/lib/types";

export type { ContactSettings };

const MAX_HOURS = 14;
const MAX_REFERENCES = 12;

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function parseHours(value: unknown): LocationHour[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .filter(
      (item): item is LocationHour =>
        typeof item?.label === "string" && typeof item?.value === "string",
    )
    .map((item) => ({ label: item.label, value: item.value }));
}

function parseReferences(value: unknown): LocationReference[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .filter((item) => typeof item?.label === "string")
    .map((item) => ({
      label: item.label as string,
      icon: isReferenceIcon(item.icon) ? item.icon : "pin",
    }));
}

export async function getContactSettings(): Promise<ContactSettings> {
  await ensureDefaults();
  const row = await prisma.contactSettings.findUnique({
    where: { id: "default" },
  });

  if (!row) {
    return { ...DEFAULT_LOCATION, updatedAt: nowIso() };
  }

  return {
    phone: row.phone.trim() || DEFAULT_LOCATION.phone,
    whatsapp: row.whatsapp.trim() || DEFAULT_LOCATION.whatsapp,
    email: row.email ?? DEFAULT_LOCATION.email,
    name: row.name.trim() || DEFAULT_LOCATION.name,
    place: row.place.trim() || DEFAULT_LOCATION.place,
    address: row.address.trim() || DEFAULT_LOCATION.address,
    mapsQuery: row.mapsQuery.trim(),
    description: row.description ?? DEFAULT_LOCATION.description,
    hours: parseHours(row.hours) ?? DEFAULT_LOCATION.hours,
    references: parseReferences(row.references) ?? DEFAULT_LOCATION.references,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function cleanList<T extends { label: string }>(
  items: T[],
  clean: (item: T) => T,
) {
  return items.map(clean).filter((item) => item.label);
}

export async function updateContactSettings(
  input: Partial<ContactSettingsInput>,
) {
  const current = await getContactSettings();
  const phone = (input.phone ?? current.phone).trim();
  const whatsapp = (input.whatsapp ?? current.whatsapp).trim();
  const email = (input.email ?? current.email).trim();
  const name = (input.name ?? current.name).trim();
  const place = (input.place ?? current.place).trim();
  const address = (input.address ?? current.address).trim();
  const mapsQuery = (input.mapsQuery ?? current.mapsQuery).trim();
  const description = (input.description ?? current.description).trim();

  const hours = cleanList(parseHours(input.hours) ?? current.hours, (item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }));
  const references = cleanList(
    parseReferences(input.references) ?? current.references,
    (item) => ({ label: item.label.trim(), icon: item.icon }),
  );

  if (!phone) throw badRequest("El teléfono es requerido");
  if (!whatsapp) throw badRequest("El WhatsApp es requerido");
  if (phone.replace(/\D/g, "").length < 10) {
    throw badRequest("El teléfono debe tener al menos 10 dígitos");
  }
  if (whatsapp.replace(/\D/g, "").length < 10) {
    throw badRequest("El WhatsApp debe tener al menos 10 dígitos");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest("El email no es válido");
  }
  if (!name) throw badRequest("El nombre del lugar es requerido");
  if (!place) throw badRequest("La zona es requerida");
  if (!address) throw badRequest("La dirección es requerida");
  if (hours.some((item) => !item.value)) {
    throw badRequest("Cada horario necesita un horario además del día");
  }
  if (hours.length > MAX_HOURS) {
    throw badRequest(`Máximo ${MAX_HOURS} horarios`);
  }
  if (references.length > MAX_REFERENCES) {
    throw badRequest(`Máximo ${MAX_REFERENCES} puntos de referencia`);
  }

  const data = {
    phone,
    whatsapp,
    email,
    name,
    place,
    address,
    mapsQuery,
    description,
    hours,
    references,
  };

  await prisma.contactSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  return getContactSettings();
}
