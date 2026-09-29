import type { Metadata } from "next";
import { cache } from "react";
import { JsonLd } from "@/components/json-ld";
import { ProductDetail } from "@/components/public/product-detail";
import { getImageUrl } from "@/lib/api";
import { formatMenuPrice } from "@/lib/menu-public";
import { getProductById } from "@/lib/products";
import { breadcrumbJsonLd, menuItemJsonLd, shareImageUrl } from "@/lib/seo";
import { pageMetadata, SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

const loadProduct = cache(async (id: string) => {
  try {
    return await getProductById(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  const path = `/platillo/${id}`;

  if (!product) {
    return {
      title: "Platillo no encontrado",
      robots: { index: false, follow: true },
    };
  }

  const price = formatMenuPrice(product.price);
  const from = product.portions && product.portions.length > 1 ? "desde " : "";
  const summary = product.description?.trim()
    ? product.description.trim()
    : `${product.name} preparado como en casa en ${SITE_NAME}.`;
  const category = product.category?.title ? ` · ${product.category.title}` : "";
  const imageUrl = getImageUrl(product.image);

  return pageMetadata({
    title: product.name,
    description: `${summary} ${from}${price}${category}. Comida típica mexicana desde 1989.`.slice(0, 300),
    path,
    ...(imageUrl && {
      image: { url: shareImageUrl(imageUrl), alt: product.name, width: 1200, height: 630 },
    }),
  });
}

export default async function PlatilloPage({ params }: Props) {
  const { id } = await params;
  const product = await loadProduct(id);

  return (
    <>
      {product && (
        <>
          <JsonLd data={menuItemJsonLd(product, getImageUrl(product.image))} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Menú", path: "/" },
              { name: product.name, path: `/platillo/${id}` },
            ])}
          />
        </>
      )}
      <ProductDetail id={id} />
    </>
  );
}
