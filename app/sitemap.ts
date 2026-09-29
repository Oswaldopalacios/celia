import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/ubicacion"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/ubicacion/como-llegar"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/galeria"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    return [
      ...pages,
      ...products.map((product) => ({
        url: absoluteUrl(`/platillo/${product.id}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return pages;
  }
}
