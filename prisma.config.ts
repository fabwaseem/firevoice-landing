import "dotenv/config";
import { defineConfig } from "prisma/config";

// The schema, its migrations and the database (DATABASE_URL, from the environment or .env).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
