import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

// One client (and one connection pool) per server process; dev's hot reload would otherwise open a new pool per edit.
const g = globalThis as unknown as { __fvPrisma?: PrismaClient };

function create() {
  const adapter = new PrismaPg({
    connectionString: env().DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    // a query that hangs is cut off instead of holding a connection
    statement_timeout: 15_000,
  });
  return new PrismaClient({ adapter });
}

export function db(): PrismaClient {
  return (g.__fvPrisma ??= create());
}
