import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  __donaCeliaPrisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está configurada. Usa la connection string de Supabase (Postgres).",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrisma() {
  const globalPrisma = globalThis as GlobalPrisma;
  if (!globalPrisma.__donaCeliaPrisma) {
    globalPrisma.__donaCeliaPrisma = createPrismaClient();
  }
  return globalPrisma.__donaCeliaPrisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}
