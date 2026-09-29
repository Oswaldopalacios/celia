import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";
  const phone = process.env.ADMIN_PHONE?.trim() || "";

  if (!email || !password) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      phone,
      userType: "admin",
    },
  });
}
