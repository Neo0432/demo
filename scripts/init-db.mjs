import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dbConfig = {
  user: process.env.POSTGRES_USER ?? "postgres_user",
  password: process.env.POSTGRES_PASSWORD ?? "postgres_password",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? "postgres_db",
};

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function createDatabaseIfNeeded() {
  const client = new Client({
    ...dbConfig,
    database: "postgres",
  });

  await client.connect();

  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(dbConfig.database)}`);
      console.log(`Database "${dbConfig.database}" created.`);
      return;
    }

    console.log(`Database "${dbConfig.database}" already exists.`);
  } finally {
    await client.end();
  }
}

async function runSqlFile(client, filePath) {
  const sql = await readFile(filePath, "utf8");
  await client.query(sql);
}

async function createTablesAndSeedData() {
  const client = new Client(dbConfig);

  await client.connect();

  try {
    await runSqlFile(client, path.join(rootDir, "database", "schema.sql"));
    await runSqlFile(client, path.join(rootDir, "database", "seed.sql"));
    console.log("Database schema and seed data are ready.");
  } finally {
    await client.end();
  }
}

async function main() {
  await createDatabaseIfNeeded();
  await createTablesAndSeedData();
}

main().catch((error) => {
  console.error("Failed to initialize database.");
  console.error(error);
  process.exitCode = 1;
});

