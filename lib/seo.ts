import { getContactSettings } from "@/lib/contact-settings";
import {
  DEFAULT_LOCATION,
  locationMapsQuery,
  mapsSearchUrl,
  toPhoneLink,
} from "@/lib/location";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import type { ContactSettings, Product } from "@/lib/types";

const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

/** Contact settings for metadata; falls back to defaults if the DB is unreachable. */
export async function getSiteContact(): Promise<ContactSettings> {
  try {
    return await getContactSettings();
  } catch {
    return { ...DEFAULT_LOCATION };
  }
}

/** WhatsApp skips WebP previews, so Cloudinary images are served as a 1200×630 JPG. */
export function shareImageUrl(url: string) {
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  return url.replace(marker, `${marker}c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/`);
}

export function restaurantJsonLd(contact: ContactSettings) {
  const telephone = toPhoneLink(contact.phone);
  const mapsQuery = locationMapsQuery(contact);

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: contact.name || SITE_NAME,
    alternateName: SITE_NAME,
    slogan: SITE_TAGLINE,
    description: contact.description || SITE_DESCRIPTION,
    url: SITE_URL,
    image: [absoluteUrl(DEFAULT_OG_IMAGE.url), absoluteUrl("/landing/Headerv2.png")],
    logo: absoluteUrl("/logoV2.png"),
    foundingDate: "1989",
    servesCuisine: ["Mexicana", "Comida típica mexicana", "Cocina casera"],
    priceRange: "$$",
    currenciesAccepted: "MXN",
    hasMenu: SITE_URL,
    ...(telephone && { telephone }),
    ...(contact.email && { email: contact.email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressCountry: "MX",
    },
    ...(mapsQuery && { hasMap: mapsSearchUrl(mapsQuery) }),
    ...(contact.hours.length > 0 && {
      openingHours: contact.hours.map((hour) => `${hour.label}: ${hour.value}`),
    }),
  };
}

export function menuItemJsonLd(product: Product, imageUrl: string) {
  const offers = product.portions?.length
    ? product.portions.map((portion) => ({
        "@type": "Offer",
        name: portion.name,
        price: portion.price,
        priceCurrency: "MXN",
      }))
    : { "@type": "Offer", price: product.price, priceCurrency: "MXN" };

  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: product.name,
    url: absoluteUrl(`/platillo/${product._id}`),
    ...(product.description && { description: product.description }),
    ...(imageUrl && { image: imageUrl }),
    offers,
    provider: { "@id": RESTAURANT_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
