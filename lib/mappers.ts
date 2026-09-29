import type {
  GalleryCategory,
  GalleryImage,
  Product,
  ProductCategory,
  ProductType,
} from "@/lib/types";

type CategoryRecord = {
  id: string;
  title: string;
  kind: ProductType;
  icon: string;
  _count?: { products: number };
};

type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: string;
  productType: ProductType;
  isSoldOut: boolean;
  isFeatured: boolean;
  image: string;
  createdAt: Date | string;
  categoryId: string;
  category?: {
    id: string;
    title: string;
    kind: ProductType;
    icon: string;
  } | null;
  portions?: { id: string; name: string; price: number; sortOrder: number }[];
};

type GalleryCategoryRecord = {
  id: string;
  title: string;
  _count?: { images: number };
};

type GalleryImageRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
  isFeatured: boolean;
  createdAt: Date | string;
  categoryId: string;
  category?: {
    id: string;
    title: string;
  } | null;
};

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

export function serializeCategory(row: CategoryRecord): ProductCategory {
  return {
    _id: row.id,
    title: row.title,
    kind: row.kind === "bebidas" ? "bebidas" : "comida",
    icon: row.icon || undefined,
    productCount: row._count?.products ?? 0,
  };
}

export function serializeProduct(row: ProductRecord): Product {
  return {
    _id: row.id,
    name: row.name,
    description: row.description || undefined,
    price: Number(row.price),
    quantity: row.quantity,
    portions: [...(row.portions ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((portion) => ({
        _id: portion.id,
        name: portion.name,
        price: Number(portion.price),
      })),
    productType: row.productType === "bebidas" ? "bebidas" : "comida",
    isSoldOut: Boolean(row.isSoldOut),
    isFeatured: Boolean(row.isFeatured),
    image: row.image || undefined,
    createdAt: toIso(row.createdAt),
    category: row.category
      ? {
          _id: row.category.id,
          title: row.category.title,
          kind: row.category.kind === "bebidas" ? "bebidas" : "comida",
          icon: row.category.icon || undefined,
        }
      : undefined,
  };
}

export function serializeGalleryCategory(
  row: GalleryCategoryRecord,
): GalleryCategory {
  return {
    _id: row.id,
    title: row.title,
    imageCount: row._count?.images ?? 0,
  };
}

export function serializeGalleryImage(row: GalleryImageRecord): GalleryImage {
  return {
    _id: row.id,
    title: row.title,
    description: row.description || undefined,
    location: row.location || undefined,
    image: row.image,
    isFeatured: Boolean(row.isFeatured),
    createdAt: toIso(row.createdAt),
    category: row.category
      ? {
          _id: row.category.id,
          title: row.category.title,
        }
      : undefined,
  };
}

export function resolveProductType(raw: unknown): ProductType {
  return raw === "bebidas" ? "bebidas" : "comida";
}

export function parseBooleanFlag(raw: unknown) {
  return raw === true || raw === "true" || raw === "1";
}

/** @deprecated Prefer parseBooleanFlag */
export function parseSoldOut(raw: unknown) {
  return parseBooleanFlag(raw);
}
