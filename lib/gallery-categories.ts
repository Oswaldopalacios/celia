import { ensureDefaults } from "@/lib/bootstrap";
import { serializeGalleryCategory } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export async function listGalleryCategories() {
  await ensureDefaults();
  const rows = await prisma.galleryCategory.findMany({
    include: { _count: { select: { images: true } } },
    orderBy: { title: "asc" },
  });
  return rows.map(serializeGalleryCategory);
}

export async function getGalleryCategoryById(id: string) {
  await ensureDefaults();
  const row = await prisma.galleryCategory.findUnique({
    where: { id },
    include: { _count: { select: { images: true } } },
  });
  return row ? serializeGalleryCategory(row) : null;
}

export async function createGalleryCategory(title: string) {
  await ensureDefaults();
  const trimmed = title.trim();
  if (!trimmed) {
    throw Object.assign(new Error("El título es requerido"), { status: 400 });
  }

  const duplicate = await prisma.galleryCategory.findFirst({
    where: { title: trimmed },
  });
  if (duplicate) {
    throw Object.assign(new Error("Ya existe una categoría con ese nombre"), {
      status: 400,
    });
  }

  const row = await prisma.galleryCategory.create({
    data: { title: trimmed },
    include: { _count: { select: { images: true } } },
  });
  return serializeGalleryCategory(row);
}

export async function updateGalleryCategory(id: string, title: string) {
  const current = await getGalleryCategoryById(id);
  if (!current) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw Object.assign(new Error("El título es requerido"), { status: 400 });
  }

  const duplicate = await prisma.galleryCategory.findFirst({
    where: { title: trimmed, NOT: { id } },
  });
  if (duplicate) {
    throw Object.assign(new Error("Ya existe una categoría con ese nombre"), {
      status: 400,
    });
  }

  const row = await prisma.galleryCategory.update({
    where: { id },
    data: { title: trimmed },
    include: { _count: { select: { images: true } } },
  });
  return serializeGalleryCategory(row);
}

export async function deleteGalleryCategory(id: string, reassignTo?: string) {
  const current = await getGalleryCategoryById(id);
  if (!current) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }

  const imageCount = current.imageCount ?? 0;

  if (imageCount > 0) {
    if (!reassignTo) {
      throw Object.assign(
        new Error(
          `Esta categoría tiene ${imageCount} imagen${imageCount === 1 ? "" : "es"}. Elige otra categoría para reasignarlas antes de eliminarla.`,
        ),
        { status: 400 },
      );
    }
    if (reassignTo === id) {
      throw Object.assign(
        new Error("La categoría de destino debe ser distinta."),
        { status: 400 },
      );
    }

    const target = await getGalleryCategoryById(reassignTo);
    if (!target) {
      throw Object.assign(new Error("La categoría de destino no existe."), {
        status: 404,
      });
    }

    await prisma.galleryImage.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignTo },
    });
  }

  await prisma.galleryCategory.delete({ where: { id } });
  return { reassignedCount: imageCount };
}
