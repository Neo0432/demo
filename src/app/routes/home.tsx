import { HomePage } from "@pages/home/home-page";
import type { DatabaseUser } from "@pages/home/model/database-user";
import { getDatabaseUsers } from "@pages/home/model/get-database-users.server";

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

export async function loader(): Promise<HomeLoaderData> {
  try {
    return {
      users: await getDatabaseUsers(),
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
