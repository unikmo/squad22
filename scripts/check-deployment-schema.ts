import pg from "pg";
import { db } from "../app/lib/ipn-db";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL is required");

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
  const columns = await client.query<{ column_name: string }>(
    "select column_name from information_schema.columns where table_schema = $1 and table_name = $2 order by ordinal_position",
    ["public", "User"],
  );
  console.log("User columns:", columns.rows.map((row) => row.column_name).join(","));

  const migrationTable = await client.query<{ migrations: string | null }>(
    "select to_regclass($1) as migrations",
    ["supabase_migrations.schema_migrations"],
  );
  console.log("Migration table:", migrationTable.rows[0]?.migrations ?? "missing");
  if (migrationTable.rows[0]?.migrations) {
    const migrations = await client.query<{ version: string; name: string }>(
      "select version, name from supabase_migrations.schema_migrations order by version",
    );
    console.log("Migrations:", migrations.rows);
  }
  const authUser = await db.user.findUnique({ where: { email: "mbanwie@googlemail.com" } });
  console.log("Prisma Auth.js user query:", authUser ? "found" : "not found (query succeeded)");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
