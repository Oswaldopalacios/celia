import { ensureDefaults } from "@/lib/bootstrap";
import { getGalleryCategoryById } from "@/lib/gallery-categories";
import { deleteGalleryImageFile, saveGalleryImage } from "@/lib/images";
import {
  parseBooleanFlag,
  serializeGalleryImage,
} from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

const imageInclude = {
  category: { select: { id: true, title: true } },
} as const;

export async function listGalleryImages(categoryId?: string) {
  await ensureDefaults();
  const rows = await prisma.galleryImage.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: imageInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(serializeGalleryImage);
}

export async function getGalleryImageById(id: string) {
  await ensureDefaults();
  const row = await prisma.galleryImage.findUnique({
    where: { id },
    include: imageInclude,
  });
  return row ? serializeGalleryImage(row) : null;
}

export type GalleryImageWrite = {
  title: string;
  description: string;
  location: string;
  categoryId: string;
  isFeatured: boolean;
  image: string;
};

export async function createGalleryImage(input: GalleryImageWrite) {
  const category = await getGalleryCategoryById(input.categoryId);
  if (!category) {
    throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
  }
  if (!input.image) {
    throw Object.assign(new Error("La imagen es requerida"), { status: 400 });
  }

  const row = await prisma.galleryImage.create({
    data: {
      title: input.title,
      description: input.description,
      location: input.location || "Restaurante Doña Celia",
      image: input.image,
      isFeatured: input.isFeatured,
      categoryId: input.categoryId,
    },
    include: imageInclude,
  });

  return serializeGalleryImage(row);
}

export async function updateGalleryImage(
  id: string,
  input: Partial<GalleryImageWrite>,
) {
  const current = await getGalleryImageById(id);
  if (!current) {
    throw Object.assign(new Error("Imagen no encontrada"), { status: 404 });
  }

  if (input.categoryId) {
    const category = await getGalleryCategoryById(input.categoryId);
    if (!category) {
      throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });
    }
  }

  const row = await prisma.galleryImage.update({
    where: { id },
    data: {
      title: input.title ?? current.title,
      description:
        input.description !== undefined
          ? input.description
          : (current.description ?? ""),
      location:
        input.location !== undefined
          ? input.location
          : (current.location ?? "Restaurante Doña Celia"),
      categoryId: input.categoryId ?? current.category?._id ?? "",
      isFeatured:
        input.isFeatured !== undefined
          ? input.isFeatured
          : Boolean(current.isFeatured),
      image: input.image !== undefined ? input.image : current.image,
    },
    include: imageInclude,
  });

  return serializeGalleryImage(row);
}

export async function removeGalleryImage(id: string) {
  const current = await getGalleryImageById(id);
  if (!current) {
    throw Object.assign(new Error("Imagen no encontrada"), { status: 404 });
  }

  await prisma.galleryImage.delete({ where: { id } });
  await deleteGalleryImageFile(current.image);
  return current;
}

export function readGalleryImageFields(formData: FormData, partial = false) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const categoryId = String(formData.get("category") ?? "").trim();
  const isFeatured = parseBooleanFlag(formData.get("isFeatured"));

  if (!partial) {
    if (!title || !categoryId) {
      throw Object.assign(
        new Error("Completa título y categoría para continuar."),
        { status: 400 },
      );
    }
  }

  return {
    title: title || undefined,
    description,
    location: location || "Restaurante Doña Celia",
    categoryId: categoryId || undefined,
    isFeatured,
  };
}

export { saveGalleryImage };
