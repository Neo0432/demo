# Demo Exam Web Starter

Стартовая база для веб-приложения на React Router, React 19, TypeScript и Tailwind CSS.

## Структура

Проект разложен по Page-first:

- `src/app/routes` - тонкие React Router routes
- `src/pages` - страницы и их локальные модели
- `src/shared` - общий UI, lib и api

## Команды

```bash
yarn dev
yarn typecheck
yarn build
```

## Документация

- [UI-kit](docs/ui-kit.md)
- [Работа с базой данных](docs/database.md)

## База данных

Пул подключений PostgreSQL лежит в `src/app/db.ts`.

Импорт пула:

```ts
import { pool } from "@app/db";
```

Важно: `pg` нельзя использовать внутри React-компонентов. Запросы к базе нужно писать в серверном коде React Router (`loader`/`action`) или в отдельном backend/API.

Пример запроса:

```ts
const result = await pool.query(
  "SELECT id, name, email FROM users LIMIT 10",
);

const users = result.rows;
```
