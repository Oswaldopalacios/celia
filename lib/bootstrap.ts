import { prisma } from "@/lib/prisma";

const DEFAULT_GALLERY_CATEGORIES = [
  "Restaurante",
  "Promocionales",
  "Eventos",
  "Platillos",
  "Nuestra cocina",
];

let bootstrapped = false;

/** Seed default gallery categories + contact row once per warm instance. */
export async function ensureDefaults() {
  if (bootstrapped) return;

  const galleryCount = await prisma.galleryCategory.count();
  if (galleryCount === 0) {
    await prisma.galleryCategory.createMany({
      data: DEFAULT_GALLERY_CATEGORIES.map((title) => ({ title })),
      skipDuplicates: true,
    });
  }

  await prisma.contactSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      phone: "755 123 4567",
      whatsapp: "755 123 4567",
    },
    update: {},
  });

  bootstrapped = true;
}
