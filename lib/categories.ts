import { ensureDefaults } from "@/lib/bootstrap";
import { isCategoryIcon } from "@/lib/category-icons";
import {
  resolveProductType,
  serializeCategory,
} from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { ProductType } from "@/lib/types";

/** First visit: drinks, then food, so Bebidas stays right after Todos. */
async function ensureCategoryOrder() {
  const rows = await prisma.category.findMany({
    select: { id: true, title: true, kind: true, sortOrder: true },
  });
  if (rows.length < 2 || rows.some((row) => row.sortOrder !== 0)) return;

  const byTitle = (a: { title: string }, b: { title: string }) =>
    a.title.localeCompare(b.title, "es");
  const ordered = [
    ...rows.filter((row) => row.kind === "bebidas").sort(byTitle),
    ...rows.filter((row) => row.kind !== "bebidas").sort(byTitle),
  ];

  await prisma.$transaction(
    ordered.map((row, index) =>
      prisma.category.update({
        where: { id: row.id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function listCategories(kind?: ProductType) {
  await ensureDefaults();
  await ensureCategoryOrder();
  const rows = await prisma.category.findMany({
    where: kind ? { kind } : undefined,
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(serializeCategory);
}

export async function getCategoryById(id: string) {
  await ensureDefaults();
  const row = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  return row ? serializeCategory(row) : null;
}

function normalizeIcon(icon: unknown) {
  if (icon === undefined || icon === null || icon === "") return "";
  if (!isCategoryIcon(icon)) {
    throw Object.assign(new Error("El ícono seleccionado no es válido"), {
      status: 400,
    });
  }
  return icon;
}

export async function createCategory(
  title: string,
  kind: ProductType,
  icon?: string,
) {
  await ensureDefaults();
  const nextIcon = normalizeIcon(icon);
  await ensureCategoryOrder();
  const last = await prisma.category.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const duplicate = await prisma.category.findFirst({
    where: { title, kind },
  });
  if (duplicate) {
    throw Object.assign(
      new Error("Ya existe una categoría con ese nombre para este tipo"),
      { status: 400 },
    );
  }

  const row = await prisma.category.create({
    data: {
      title,
      kind,
      icon: nextIcon,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    include: { _count: { select: { products: true } } },
  });
  return serializeCategory(row);
}

export async function updateCategory(
  id: string,
  payload: { title?: string; kind?: ProductType; icon?: string },
) {
  const current = await getCategoryById(id);
  if (!current) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }

  const nextTitle = payload.title?.trim() || current.title;
  const nextKind = payload.kind
    ? resolveProductType(payload.kind)
    : (current.kind ?? "comida");
  const nextIcon =
    payload.icon === undefined
      ? (current.icon ?? "")
      : normalizeIcon(payload.icon);

  if (!nextTitle) {
    throw Object.assign(new Error("El título es requerido"), { status: 400 });
  }

  const duplicate = await prisma.category.findFirst({
    where: {
      title: nextTitle,
      kind: nextKind,
      NOT: { id },
    },
  });
  if (duplicate) {
    throw Object.assign(
      new Error("Ya existe una categoría con ese nombre para este tipo"),
      { status: 400 },
    );
  }

  const row = await prisma.category.update({
    where: { id },
    data: { title: nextTitle, kind: nextKind, icon: nextIcon },
    include: { _count: { select: { products: true } } },
  });
  return serializeCategory(row);
}

export async function reorderCategories(ids: string[]) {
  await ensureDefaults();
  const rows = await prisma.category.findMany({ select: { id: true } });
  const known = new Set(rows.map((row) => row.id));

  if (
    ids.length !== rows.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !known.has(id))
  ) {
    throw Object.assign(
      new Error("El orden debe incluir cada categoría una sola vez."),
      { status: 400 },
    );
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listCategories();
}

export async function deleteCategory(id: string, reassignTo?: string) {
  const current = await getCategoryById(id);
  if (!current) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }

  const productCount = current.productCount ?? 0;

  if (productCount > 0) {
    if (!reassignTo) {
      throw Object.assign(
        new Error(
          `Esta categoría tiene ${productCount} producto${productCount === 1 ? "" : "s"}. Debes elegir otra categoría para reasignarlos antes de eliminarla.`,
        ),
        { status: 400 },
      );
    }
    if (reassignTo === id) {
      throw Object.assign(
        new Error("La categoría de destino debe ser distinta a la que eliminas."),
        { status: 400 },
      );
    }

    const target = await getCategoryById(reassignTo);
    if (!target) {
      throw Object.assign(new Error("La categoría de destino no existe."), {
        status: 404,
      });
    }
    if ((target.kind ?? "comida") !== (current.kind ?? "comida")) {
      throw Object.assign(
        new Error(
          "La categoría de destino debe ser del mismo tipo (comida o bebidas).",
        ),
        { status: 400 },
      );
    }

    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignTo },
    });
  }

  await prisma.category.delete({ where: { id } });
  return { reassignedCount: productCount };
}
