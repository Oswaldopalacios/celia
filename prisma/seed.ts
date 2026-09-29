import "dotenv/config";
import { ensureAdmin } from "../lib/ensure-admin";
import { prisma } from "../lib/prisma";

async function main() {
  await ensureAdmin();
  const count = await prisma.user.count();
  console.log(`Admin listo. Usuarios en base: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
