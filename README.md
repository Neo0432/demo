# Demo Exam Web Starter

Стартовая база для веб-приложения на React Router, React 19, TypeScript и Tailwind CSS.

## Структура

Проект разложен по FSD:

- `src/app/routes` - тонкие React Router routes
- `src/pages` - страницы
- `src/widgets` - крупные композиционные блоки
- `src/features` - пользовательские сценарии и самостоятельные фичи
- `src/entities` - доменные сущности
- `src/shared` - общий UI, lib и api

## Команды

```bash
yarn dev
yarn typecheck
yarn build
```

## База данных

Фронтовый клиент для прямых запросов лежит в `src/shared/api/database-client.ts`.

Ожидаемые переменные окружения:

```bash
VITE_DATABASE_URL=https://example.com
VITE_DATABASE_TOKEN=token
```

Пример:

```ts
import { databaseClient } from "@shared/api/database-client";

type User = { id: number; name: string };

const users = await databaseClient.select<User>("users");
const created = await databaseClient.insert<User>("users", { name: "Demo" });
```
