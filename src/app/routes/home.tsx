import { HomePage } from "@pages/home/home-page";
import type { DatabaseUser } from "@pages/home/model/database-user";
import { pool } from "@app/db";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Demo UI Kit" },
    { name: "description", content: "Стартовый UI-kit для демо-экзамена" },
  ];
}

export interface HomeLoaderData {
  users: DatabaseUser[];
  usersError: string | null;
}

interface UserRow {
  id: number;
  username: string;
  role: string;
  passwordHash: string;
}

function normalizeUserRole(role: string): DatabaseUser["role"] {
  return role === "admin" ? "admin" : "user";
}

export async function loader(): Promise<HomeLoaderData> {
  try {
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

    return {
      users: result.rows.map((user) => ({
        id: user.id,
        username: user.username,
        role: normalizeUserRole(user.role),
        passwordHash: user.passwordHash,
      })),
      usersError: null,
    };
  } catch (error) {
    console.error("Home loader database error:", error);

    return {
      users: [],
      usersError: "Не удалось получить пользователей из базы данных.",
    };
  }
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return (
    <HomePage users={loaderData.users} usersError={loaderData.usersError} />
  );
}
