import { AuthPage } from "@pages/auth/auth-page";
import type { AuthActionResult } from "@pages/auth/model/auth-action-result";
import { pool } from "@app/db";

import type { Route } from "./+types/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Авторизация" },
    { name: "description", content: "Страница авторизации" },
  ];
}

interface UserRow {
  id: number;
  email: string;
  name: string | null;
}

export async function action({
  request,
}: Route.ActionArgs): Promise<AuthActionResult> {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Введите email и пароль.",
      fields: { email },
    };
  }

  try {
    const result = await pool.query<UserRow>(
      `
        SELECT id, email, name
        FROM users
        WHERE email = $1 AND password = $2
        LIMIT 1
      `,
      [email, password],
    );

    const user = result.rows[0];

    if (!user) {
      return {
        status: "error",
        message: "Пользователь с таким email и паролем не найден.",
        fields: { email },
      };
    }

    return {
      status: "success",
      message: "Авторизация прошла успешно.",
      user,
    };
  } catch (error) {
    console.error("Auth action database error:", error);

    return {
      status: "error",
      message: "Не удалось проверить пользователя. Попробуйте позже.",
      fields: { email },
    };
  }
}

export default AuthPage;
