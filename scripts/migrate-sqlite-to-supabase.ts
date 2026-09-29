/**
 * One-shot: copy local SQLite (data/aquarena.db) → Supabase Postgres via Prisma.
 *
 * Usage: npx tsx scripts/migrate-sqlite-to-supabase.ts
 */
import "dotenv/config";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProductType, type UserType } from "@prisma/client";

const SQLITE_PATH = path.join(process.cwd(), "data", "aquarena.db");

function asBool(value: unknown) {
  return value === 1 || value === true || value === "1";
}

function asDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function asProductType(value: unknown): ProductType {
  return value === "bebidas" ? "bebidas" : "comida";
}

function asUserType(value: unknown): UserType {
  return value === "operator" ? "operator" : "admin";
}

async function main() {
  const connectionString =
    process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString || connectionString.startsWith("file:")) {
    throw new Error(
      "Configura DATABASE_URL / DIRECT_URL de Supabase (Postgres) en .env",
    );
  }

  const sqlite = new DatabaseSync(SQLITE_PATH);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  console.log("Leyendo SQLite:", SQLITE_PATH);

  const users = sqlite.prepare("SELECT * FROM users").all() as Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    userType: string;
    createdAt: string;
  }>;

  const categories = sqlite.prepare("SELECT * FROM categories").all() as Array<{
    id: string;
    title: string;
    kind: string;
    createdAt: string;
  }>;

  const products = sqlite.prepare("SELECT * FROM products").all() as Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: string;
    productType: string;
    isSoldOut: number;
    isFeatured: number;
    image: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
  }>;

  const galleryCategories = sqlite
    .prepare("SELECT * FROM gallery_categories")
    .all() as Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;

  const galleryImages = sqlite
    .prepare("SELECT * FROM gallery_images")
    .all() as Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    image: string;
    isFeatured: number;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
  }>;

  const contact = sqlite
    .prepare("SELECT * FROM contact_settings WHERE id = 'default' LIMIT 1")
    .get() as
    | { id: string; phone: string; whatsapp: string; updatedAt: string }
    | undefined;

  console.log({
    users: users.length,
    categories: categories.length,
    products: products.length,
    galleryCategories: galleryCategories.length,
    galleryImages: galleryImages.length,
    contact: contact ? 1 : 0,
  });

  await prisma.$transaction(async (tx) => {
    // Wipe target tables (order matters for FKs)
    await tx.galleryImage.deleteMany();
    await tx.galleryCategory.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();
    await tx.contactSettings.deleteMany();
    await tx.user.deleteMany();

    if (users.length) {
      await tx.user.createMany({
        data: users.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password,
          phone: row.phone ?? "",
          userType: asUserType(row.userType),
          createdAt: asDate(row.createdAt),
        })),
      });
    }

    if (categories.length) {
      await tx.category.createMany({
        data: categories.map((row) => ({
          id: row.id,
          title: row.title,
          kind: asProductType(row.kind),
          createdAt: asDate(row.createdAt),
        })),
      });
    }

    if (products.length) {
      await tx.product.createMany({
        data: products.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? "",
          price: Number(row.price),
          quantity: row.quantity ?? "1",
          productType: asProductType(row.productType),
          isSoldOut: asBool(row.isSoldOut),
          isFeatured: asBool(row.isFeatured),
          image: row.image ?? "",
          categoryId: row.categoryId,
          createdAt: asDate(row.createdAt),
          updatedAt: asDate(row.updatedAt),
        })),
      });
    }

    if (galleryCategories.length) {
      await tx.galleryCategory.createMany({
        data: galleryCategories.map((row) => ({
          id: row.id,
          title: row.title,
          createdAt: asDate(row.createdAt),
        })),
      });
    }

    if (galleryImages.length) {
      await tx.galleryImage.createMany({
        data: galleryImages.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description ?? "",
          location: row.location ?? "Restaurante Doña Celia",
          image: row.image,
          isFeatured: asBool(row.isFeatured),
          categoryId: row.categoryId,
          createdAt: asDate(row.createdAt),
          updatedAt: asDate(row.updatedAt),
        })),
      });
    }

    if (contact) {
      await tx.contactSettings.create({
        data: {
          id: "default",
          phone: contact.phone,
          whatsapp: contact.whatsapp,
          updatedAt: asDate(contact.updatedAt),
        },
      });
    }
  });

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    galleryCategories: await prisma.galleryCategory.count(),
    galleryImages: await prisma.galleryImage.count(),
    contact: await prisma.contactSettings.count(),
  };

  console.log("Migración OK → Supabase:", counts);
  await prisma.$disconnect();
  sqlite.close();
}

main().catch(async (error) => {
  console.error("Migración falló:", error);
  process.exit(1);
});
