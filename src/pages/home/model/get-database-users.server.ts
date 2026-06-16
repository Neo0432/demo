import { pool } from "@app/db";

import type { DatabaseUser } from "./database-user";

interface UserRow {
  id: number;
  username: string;
  role: string;
  passwordHash: string;
}

function normalizeUserRole(role: string): DatabaseUser["role"] {
  return role === "admin" ? "admin" : "user";
}

export async function getDatabaseUsers(): Promise<DatabaseUser[]> {
  const result = await pool.query<UserRow>(`
    SELECT
      users.id,
      users.username,
      roles.name AS role,
      users.password_hash AS "passwordHash"
    FROM users
    INNER JOIN roles ON roles.id = users.role_id
    ORDER BY users.id ASC
  `);

  return result.rows.map((user) => ({
    id: user.id,
    username: user.username,
    role: normalizeUserRole(user.role),
    passwordHash: user.passwordHash,
  }));
}

