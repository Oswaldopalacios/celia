import { ensureDefaults } from "@/lib/bootstrap";
import { getCategoryById } from "@/lib/categories";
import { deleteProductImage } from "@/lib/images";
import {
  parseBooleanFlag,
  resolveProductType,
  serializeProduct,
} from "@/lib/mappers";
import {
  lowestPortionPrice,
  MAX_PORTION_NAME,
  MAX_PORTIONS,
} from "@/lib/portions";
import { nowIso, prisma } from "@/lib/prisma";
import type { ProductType } from "@/lib/types";

const productInclude = {
  category: { select: { id: true, title: true, kind: true, icon: true } },
  portions: {
    select: { id: true, name: true, price: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  },
} as const;

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function listProducts() {
  await ensureDefaults();
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(serializeProduct);
}

export async function getProductById(id: string) {
  await ensureDefaults();
  const row = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  return row ? serializeProduct(row) : null;
}

export type PortionWrite = {
  id?: string;
  name: string;
  price: number;
};

export type ProductWrite = {
  name: string;
  description: string;
  price: number;
  quantity: string;
  productType: ProductType;
  isSoldOut: boolean;
  isFeatured: boolean;
  categoryId: string;
  image?: string;
  portions?: PortionWrite[];
};

export async function createProduct(input: ProductWrite) {
  const category = await getCategoryById(input.categoryId);
  if (!category) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }

  const portions = input.portions ?? [];
  const row = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: portions.length ? lowestPortionPrice(portions) : input.price,
      quantity: input.quantity,
      productType: input.productType,
      isSoldOut: input.isSoldOut,
      isFeatured: input.isFeatured,
      image: input.image ?? "",
      categoryId: input.categoryId,
      portions: {
        create: portions.map((portion, index) => ({
          name: portion.name,
          price: portion.price,
          sortOrder: index,
        })),
      },
    },
    include: productInclude,
  });

  return serializeProduct(row);
}

/** Replace a product's portions, keeping ids of the ones that still exist. */
async function syncPortions(tx: Tx, productId: string, portions: PortionWrite[]) {
  const existing = await tx.productPortion.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((portion) => portion.id));
  const keptIds = portions
    .map((portion) => portion.id)
    .filter((id): id is string => Boolean(id && existingIds.has(id)));

  await tx.productPortion.deleteMany({
    where: { productId, id: { notIn: keptIds } },
  });

  for (const [index, portion] of portions.entries()) {
    const data = { name: portion.name, price: portion.price, sortOrder: index };
    if (portion.id && existingIds.has(portion.id)) {
      await tx.productPortion.update({ where: { id: portion.id }, data });
    } else {
      await tx.productPortion.create({ data: { ...data, productId } });
    }
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductWrite> & { image?: string },
) {
  const current = await getProductById(id);
  if (!current) {
    throw Object.assign(new Error("Producto no encontrado"), { status: 404 });
  }

  if (input.categoryId) {
    const category = await getCategoryById(input.categoryId);
    if (!category) {
      throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
    }
  }

  const row = await prisma.$transaction(async (tx) => {
    if (input.portions) await syncPortions(tx, id, input.portions);

    const portions = await tx.productPortion.findMany({
      where: { productId: id },
      select: { price: true },
    });

    return tx.product.update({
      where: { id },
      data: {
        name: input.name ?? current.name,
        description:
          input.description !== undefined
            ? input.description
            : (current.description ?? ""),
        price: portions.length
          ? lowestPortionPrice(portions)
          : (input.price ?? current.price),
        quantity: input.quantity ?? current.quantity ?? "1",
        productType:
          input.productType ?? resolveProductType(current.productType),
        isSoldOut:
          input.isSoldOut !== undefined
            ? input.isSoldOut
            : Boolean(current.isSoldOut),
        isFeatured:
          input.isFeatured !== undefined
            ? input.isFeatured
            : Boolean(current.isFeatured),
        categoryId: input.categoryId ?? current.category?._id ?? "",
        image: input.image !== undefined ? input.image : (current.image ?? ""),
      },
      include: productInclude,
    });
  });

  return serializeProduct(row);
}

export async function removeProduct(id: string) {
  const current = await getProductById(id);
  if (!current) {
    throw Object.assign(new Error("Producto no encontrado"), { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  await deleteProductImage(current.image);
  return current;
}

export async function getCatalogStats() {
  await ensureDefaults();
  const [products, categories, soldOut, comida, bebidas, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { isSoldOut: true } }),
      prisma.product.count({ where: { productType: "comida" } }),
      prisma.product.count({ where: { productType: "bebidas" } }),
      prisma.product.findMany({
        include: productInclude,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

  return {
    generatedAt: nowIso(),
    catalog: {
      products,
      categories,
      soldOut,
      comida,
      bebidas,
    },
    recentProducts: recent.map(serializeProduct),
  };
}

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

/** `undefined` when the form didn't send portions (leave them as they are). */
function readPortions(raw: FormDataEntryValue | null): PortionWrite[] | undefined {
  if (raw === null) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(raw));
  } catch {
    throw badRequest("Las porciones no tienen un formato válido.");
  }
  if (!Array.isArray(parsed)) {
    throw badRequest("Las porciones no tienen un formato válido.");
  }
  if (parsed.length > MAX_PORTIONS) {
    throw badRequest(`Máximo ${MAX_PORTIONS} porciones por producto.`);
  }

  const seen = new Set<string>();
  return parsed.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const name = String(item.name ?? "").trim().slice(0, MAX_PORTION_NAME);
    const price = Number(item.price);

    if (!name) throw badRequest("Cada porción necesita un nombre.");
    const key = name.toLocaleLowerCase("es");
    if (seen.has(key)) {
      throw badRequest(`La porción "${name}" está repetida.`);
    }
    seen.add(key);
    if (!Number.isFinite(price) || price <= 0) {
      throw badRequest(`El precio de "${name}" debe ser mayor a cero.`);
    }

    return {
      id: typeof item._id === "string" && item._id ? item._id : undefined,
      name,
      price,
    };
  });
}

export function readProductFields(formData: FormData, partial = false) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const categoryId = String(formData.get("category") ?? "").trim();
  const productType = resolveProductType(formData.get("productType"));
  const isSoldOut = parseBooleanFlag(formData.get("isSoldOut"));
  const isFeatured = parseBooleanFlag(formData.get("isFeatured"));
  const portions = readPortions(formData.get("portions"));
  const usesPortions = Boolean(portions?.length);

  if (!partial && (!name || !categoryId || (!priceRaw && !usesPortions))) {
    throw badRequest("Completa nombre, precio y categoría para continuar.");
  }

  let price: number | undefined;
  if (usesPortions) {
    price = lowestPortionPrice(portions!);
  } else if (priceRaw) {
    price = Number(priceRaw);
    if (Number.isNaN(price) || price <= 0) {
      throw badRequest("El precio debe ser un número válido");
    }
  } else if (!partial || portions) {
    throw badRequest("El precio debe ser un número válido");
  }

  return {
    name: name || undefined,
    description,
    price,
    quantity: quantityRaw || "1",
    categoryId: categoryId || undefined,
    productType,
    isSoldOut,
    isFeatured,
    portions,
  };
}
