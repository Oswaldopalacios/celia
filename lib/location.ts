import type {
  ContactSettings,
  LocationReferenceIcon,
} from "@/lib/types";

export const REFERENCE_ICONS: { id: LocationReferenceIcon; label: string }[] = [
  { id: "palm", label: "Palmera" },
  { id: "pin", label: "Ubicación" },
  { id: "car", label: "Auto" },
  { id: "waves", label: "Agua" },
  { id: "sun", label: "Sol" },
  { id: "fork", label: "Comida" },
  { id: "house", label: "Lugar" },
  { id: "star", label: "Destacado" },
];

export function isReferenceIcon(value: unknown): value is LocationReferenceIcon {
  return REFERENCE_ICONS.some((icon) => icon.id === value);
}

export const DEFAULT_LOCATION: Omit<ContactSettings, "updatedAt"> = {
  phone: "755 123 4567",
  whatsapp: "755 123 4567",
  email: "",
  name: "Doña Celia Restaurante",
  place: "Restaurante Doña Celia",
  address: "Restaurante Doña Celia, México",
  mapsQuery: "",
  description:
    "Desde 1989, Doña Celia cocina como en casa: masa hecha a mano, guisados de olla y salsas molcajeteadas. Siéntate a la mesa, pide tu antojito favorito y quédate a la sobremesa.",
  hours: [
    { label: "Lunes - Domingo", value: "8:00 a.m. - 6:00 p.m." },
    { label: "Desayunos", value: "8:00 a.m. - 12:00 p.m." },
  ],
  references: [
    { label: "Cocina tradicional desde 1989", icon: "fork" },
    { label: "Ambiente familiar", icon: "house" },
    { label: "Estacionamiento disponible", icon: "car" },
  ],
};

/** Query used for Google Maps: explicit maps query, or the address. */
export function locationMapsQuery(
  location: Pick<ContactSettings, "mapsQuery" | "address">,
) {
  return location.mapsQuery.trim() || location.address.trim();
}

/** Keep only digits for tel: / wa.me links. */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Build E.164-ish Mexico number for links when no country code is present. */
export function toPhoneLink(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("52") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;
  return `+${digits}`;
}

export function toWhatsAppNumber(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("52") && digits.length >= 12) return digits;
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export function whatsappUrl(
  phone: string,
  message = "Hola Doña Celia, quiero información para visitarlos.",
) {
  const number = toWhatsAppNumber(phone);
  if (!number) return "#";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string) {
  const link = toPhoneLink(phone);
  return link ? `tel:${link}` : "#";
}
