# Работа с базой данных

Докер: https://github.com/FixvolvV/Compose

В проект добавлена библиотека `pg` и общий пул подключений к PostgreSQL:

```ts
import { pool } from "@app/db";
```

Файл подключения: `src/app/db.ts`.

```ts
import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres_user",
  password: "postgres_password",
  host: "localhost",
  port: 5432,
  database: "postgres_db",
});
```

## Важное правило

`pg` работает только в Node.js. Нельзя импортировать `pool` внутрь React-компонентов, `useEffect`, обработчиков `onClick` и другого кода, который попадет в браузер.

Правильно:

- использовать `pool.query` в `loader`
- использовать `pool.query` в `action`
- импортировать `pool` только в серверном коде роутов

Неправильно:

```tsx
export function UsersPage() {
  async function loadUsers() {
    // Так делать нельзя: этот код окажется в браузере.
    const result = await pool.query("SELECT * FROM users");
  }

  return <button onClick={loadUsers}>Загрузить</button>;
}
```

Браузер не умеет работать с TCP-подключениями PostgreSQL и Node-модулями вроде `net`/`fs`, поэтому такой код сломает сборку или приложение.

## Режим React Router

Работа с `pg` через `loader` и `action` требует серверного runtime React Router. Для этого в `react-router.config.ts` должен быть включен серверный режим:

```ts
export default {
  appDirectory: "src/app",
  ssr: true,
};
```

Если проект работает как чистая SPA с `ssr: false`, то серверные `loader`/`action` для прямого доступа к PostgreSQL использовать нельзя. В таком случае нужен отдельный backend/API или нужно включить серверный режим.

## Чтение данных через loader

`loader` выполняется на сервере при GET-запросе к роуту. В нем удобно читать данные из базы и отдавать их React-компоненту.

Пример `src/app/routes/users.tsx`:

```tsx
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

import { pool } from "@app/db";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id DESC LIMIT 10",
    );

    return { users: result.rows };
  } catch (error) {
    console.error("Database request failed:", error);
    throw new Response("Ошибка базы данных", { status: 500 });
  }
}

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  );
}
```

## Запись данных через action

`action` выполняется на сервере при отправке формы или mutation-запроса. В нем удобно создавать, обновлять и удалять записи.

Пример создания пользователя:

```tsx
import { Form, redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";

import { pool } from "@app/db";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");

  await pool.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
    name,
    email,
  ]);

  return redirect("/users");
}

export default function CreateUserPage() {
  return (
    <Form method="post">
      <input name="name" placeholder="Имя" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Создать</button>
    </Form>
  );
}
```

## Безопасные SQL-запросы

Всегда передавай пользовательские данные через параметры `$1`, `$2`, `$3`, а не вставляй строки напрямую.

Правильно:

```ts
await pool.query("SELECT * FROM users WHERE email = $1", [email]);
```

Неправильно:

```ts
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

Параметризованные запросы защищают от SQL-инъекций и проблем с кавычками.

## Типизация результата

Можно типизировать строки результата через generic:

```ts
interface UserRow {
  id: number;
  name: string;
  email: string;
}

const result = await pool.query<UserRow>(
  "SELECT id, name, email FROM users LIMIT 10",
);

const users = result.rows;
```

## Где хранить SQL

Для маленького демо-проекта нормально писать SQL прямо в `loader`/`action` нужного route-файла.

Если запросов станет больше, можно вынести их рядом со страницей:

```txt
src/pages/users/
  users-page.tsx
  model/
    users-queries.ts
```

Но сам `pool` лучше держать в одном месте: `src/app/db.ts`.
