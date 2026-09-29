import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

let ensured = false;

export async function ensureAdmin() {
  if (ensured) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";
  const phone = process.env.ADMIN_PHONE?.trim() || "";

  if (!email || !password) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
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
  ensured = true;
}
