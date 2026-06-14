import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    // Prisma CLI executes in a separate process; ensure env var is present.
    // If missing, fail loudly with a clear error.
    url: (() => {
      const v = process.env.DATABASE_URL;
      if (!v) {
        throw new Error("Missing DATABASE_URL env var");
      }
      return v;
    })(),
  },
});


