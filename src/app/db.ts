import { Pool } from "pg";

// Креды из docker-compose.yaml для локальной PostgreSQL.
export const pool = new Pool({
  user: "postgres_user",
  password: "postgres_password",
  host: "localhost",
  port: 5432,
  database: "postgres_db",
});
