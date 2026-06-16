# Работа с базой данных

Докер: https://github.com/FixvolvV/Compose.git

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

## Инициализация базы

После запуска PostgreSQL через `docker-compose.yml` можно создать базу, таблицы и стартовые записи командой:

```bash
yarn db:init
```

Команда выполняет `scripts/init-db.mjs`:

- подключается к PostgreSQL на `localhost:5432`
- создает базу `postgres_db`, если ее еще нет
- применяет `database/schema.sql`
- применяет `database/seed.sql`

По умолчанию используются те же креды, что и в `docker-compose.yml`:

```txt
POSTGRES_USER=postgres_user
POSTGRES_PASSWORD=postgres_password
POSTGRES_DB=postgres_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Если нужно, их можно переопределить через переменные окружения перед запуском команды.

## Схема таблиц

Схема лежит в `database/schema.sql`.

Таблица `roles`:

```sql
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Таблица `users`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Связь такая: `users.role_id -> roles.id`.

Для фронта поле `password_hash` удобно отдавать как `passwordHash` через SQL alias:

```sql
SELECT
  users.id,
  users.username,
  roles.name AS role,
  users.password_hash AS "passwordHash"
FROM users
INNER JOIN roles ON roles.id = users.role_id
ORDER BY users.id ASC;
```

## Изменение структуры и данных

Для демо-проекта есть три удобных сценария.

### 1. Изменить структуру без удаления данных

Если нужно добавить колонку, переименовать поле, создать индекс или новую таблицу, можно написать отдельный SQL-файл миграции:

```txt
database/migrations/
  001-init.sql
  002-add-user-email.sql
  003-rename-password-field.sql
```

Пример миграции:

```sql
ALTER TABLE users ADD COLUMN email TEXT;
```

Такой вариант нужен, если данные в базе хочется сохранить.

### 2. Поправить или удалить записи

Если структура не меняется, а нужно только обновить данные, используй обычные SQL-запросы:

```sql
UPDATE users
SET username = 'admin'
WHERE id = 1;

DELETE FROM users
WHERE username = 'test';
```

Для повторяемых правок можно складывать такие запросы в отдельные файлы, например:

```txt
database/fixes/
  001-normalize-usernames.sql
  002-delete-test-users.sql
```

### 3. Полностью пересоздать базу

Если данные не важны и нужно получить чистую базу с актуальной схемой, проще снести Docker volume и создать все заново:

```bash
docker compose down -v
docker compose up -d
yarn db:init
```

`docker compose down -v` удаляет volume PostgreSQL вместе со всеми данными. После этого `yarn db:init` снова создаст базу, таблицы и стартовые записи из `database/schema.sql` и `database/seed.sql`.

Для экзамена обычно достаточно держать:

- `database/schema.sql` - актуальная структура
- `database/seed.sql` - стартовые данные
- `yarn db:init` - команда для подготовки базы

Если структура изменилась во время разработки и данные не жалко, самый быстрый путь: обновить `schema.sql`, выполнить `docker compose down -v`, затем `docker compose up -d` и `yarn db:init`.

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

## GET по кнопке через useFetcher

Если GET-запрос нужен по клику без перехода страницы, используй resource route и `useFetcher`.

Route:

```ts
route("resources/users", "routes/resources/users.ts");
```

Resource loader:

```ts
import { getDatabaseUsers } from "@pages/home/model/get-database-users.server";

export async function loader() {
  return {
    users: await getDatabaseUsers(),
    usersError: null,
  };
}
```

Компонент:

```tsx
import { useFetcher } from "react-router";

export function UsersModalExample() {
  const usersFetcher = useFetcher<{
    users: DatabaseUser[];
    usersError: string | null;
  }>();

  function openModal() {
    setModalOpen(true);
    usersFetcher.load("/resources/users");
  }

  return (
    <>
      <button type="button" onClick={openModal}>
        Открыть пользователей
      </button>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Пользователи">
        {usersFetcher.state === "loading" && <p>Загрузка...</p>}
        {usersFetcher.data && (
          <DataTable columns={columns} data={usersFetcher.data.users} />
        )}
      </Modal>
    </>
  );
}
```

Такой запрос остается GET-запросом к loader, но не меняет URL текущей страницы.

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
