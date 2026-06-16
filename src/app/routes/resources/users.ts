import type { DatabaseUser } from "@pages/home/model/database-user";
import { getDatabaseUsers } from "@pages/home/model/get-database-users.server";

import type { Route } from "./+types/users";

export interface UsersResourceLoaderData {
  users: DatabaseUser[];
  usersError: string | null;
}

export async function loader(
  {}: Route.LoaderArgs,
): Promise<UsersResourceLoaderData> {
  try {
    return {
      users: await getDatabaseUsers(),
      usersError: null,
    };
  } catch (error) {
    console.error("Users resource loader database error:", error);

    return {
      users: [],
      usersError: "Не удалось получить пользователей из базы данных.",
    };
  }
}

