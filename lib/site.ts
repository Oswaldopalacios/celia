import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.restaurantedonacelia.com.mx"
).replace(/\/+$/, "");

export const SITE_NAME = "Doña Celia";
export const SITE_TAGLINE = "Las manos del buen sabor";
export const SITE_DESCRIPTION =
  "Restaurante Doña Celia: comida típica mexicana hecha en casa desde 1989. Antojitos, guisados, caldos, desayunos y aguas frescas. Las manos del buen sabor.";
export const SITE_KEYWORDS = [
  "Doña Celia",
  "restaurante Doña Celia",
  "comida mexicana",
  "comida típica mexicana",
  "cocina tradicional",
  "comida casera",
  "antojitos mexicanos",
  "guisados",
  "caldos",
  "desayunos",
  "aguas frescas",
  "restaurante familiar",
  "menú",
];

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Restaurante Doña Celia, las manos del buen sabor, desde 1989",
};

type PageMetadataInput = {
  /** Uses the layout title template unless `absoluteTitle` is set. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
};

/**
 * Child `openGraph`/`twitter` objects replace the parent's instead of merging,
 * so every page builds the full set here.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_MX",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
  };
}
