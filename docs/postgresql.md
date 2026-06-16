# PostgreSQL SQL справочник

Краткая шпаргалка по SQL для PostgreSQL. Примеры можно использовать в `loader`, `action`, `scripts/*.mjs`, `database/schema.sql`, `database/seed.sql`.

## Базовый синтаксис

```sql
-- комментарий в одну строку
/* комментарий в несколько строк */

SELECT 1;
SELECT 'text';
SELECT NOW();
```

Строки пишутся в одинарных кавычках:

```sql
SELECT 'admin';
```

Идентификаторы в двойных кавычках чувствительны к регистру:

```sql
SELECT "passwordHash" FROM users;
```

Лучше использовать `snake_case`, чтобы кавычки не были нужны:

```sql
SELECT password_hash FROM users;
```

## Типы данных

Частые типы:

```sql
INTEGER              -- целое число
SERIAL               -- автоинкремент integer
BIGSERIAL            -- автоинкремент bigint
TEXT                 -- строка любой длины
VARCHAR(255)         -- строка до N символов
BOOLEAN              -- true / false
DATE                 -- дата
TIME                 -- время
TIMESTAMP            -- дата + время
TIMESTAMPTZ          -- дата + время с timezone
NUMERIC(10, 2)       -- точное число, удобно для денег
REAL                 -- число с плавающей точкой
DOUBLE PRECISION     -- более точное float-число
UUID                 -- uuid
JSONB                -- JSON в бинарном виде
TEXT[]               -- массив строк
```

Приведение типа:

```sql
SELECT '123'::INTEGER;
SELECT NOW()::DATE;
```

## Создание таблицы

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Создать, только если таблицы еще нет:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY
);
```

## Constraints

```sql
PRIMARY KEY                 -- первичный ключ
NOT NULL                    -- поле обязательно
UNIQUE                      -- уникальное значение
DEFAULT NOW()               -- значение по умолчанию
CHECK (age >= 18)           -- проверка условия
REFERENCES roles(id)        -- внешний ключ
```

Пример:

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('user', 'admin'))
);
```

## Foreign key

Связь `users.role_id -> roles.id`:

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id)
);
```

Поведение при изменении/удалении:

```sql
REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
REFERENCES roles(id) ON DELETE CASCADE
REFERENCES roles(id) ON DELETE SET NULL
```

## INSERT

```sql
INSERT INTO roles (name)
VALUES ('admin');
```

Несколько строк:

```sql
INSERT INTO roles (name)
VALUES ('user'), ('admin');
```

Вернуть созданную строку:

```sql
INSERT INTO users (username, role_id, password_hash)
VALUES ('admin', 1, 'hash')
RETURNING id, username;
```

Вставка через `SELECT`:

```sql
INSERT INTO users (username, role_id, password_hash)
SELECT 'admin', roles.id, 'hash'
FROM roles
WHERE roles.name = 'admin';
```

## SELECT

```sql
SELECT * FROM users;

SELECT id, username
FROM users;
```

Alias:

```sql
SELECT
  users.id,
  users.password_hash AS "passwordHash"
FROM users;
```

Уникальные значения:

```sql
SELECT DISTINCT role_id FROM users;
```

## WHERE

```sql
SELECT *
FROM users
WHERE username = 'admin';
```

Операторы:

```sql
=
!=
<>
>
>=
<
<=
```

Комбинации:

```sql
SELECT *
FROM users
WHERE role_id = 1 AND username = 'admin';

SELECT *
FROM users
WHERE role_id = 1 OR role_id = 2;
```

Проверка на `NULL`:

```sql
WHERE deleted_at IS NULL
WHERE deleted_at IS NOT NULL
```

## IN, BETWEEN, LIKE

```sql
SELECT *
FROM users
WHERE role_id IN (1, 2, 3);
```

```sql
SELECT *
FROM orders
WHERE amount BETWEEN 1000 AND 5000;
```

`LIKE` чувствителен к регистру, `ILIKE` не чувствителен:

```sql
SELECT *
FROM users
WHERE username LIKE 'adm%';

SELECT *
FROM users
WHERE username ILIKE '%admin%';
```

Маски:

```sql
%  -- любое количество символов
_  -- один любой символ
```

## ORDER BY, LIMIT, OFFSET

```sql
SELECT *
FROM users
ORDER BY id ASC;
```

```sql
SELECT *
FROM users
ORDER BY created_at DESC
LIMIT 10
OFFSET 20;
```

## UPDATE

```sql
UPDATE users
SET username = 'new_name'
WHERE id = 1;
```

Несколько полей:

```sql
UPDATE users
SET
  username = 'admin',
  password_hash = 'new_hash'
WHERE id = 1
RETURNING id, username;
```

Без `WHERE` обновятся все строки.

## DELETE

```sql
DELETE FROM users
WHERE id = 1;
```

Вернуть удаленные строки:

```sql
DELETE FROM users
WHERE role_id = 2
RETURNING id, username;
```

Без `WHERE` удалятся все строки.

## TRUNCATE

Быстро очистить таблицу:

```sql
TRUNCATE TABLE users;
```

Очистить и сбросить `SERIAL`:

```sql
TRUNCATE TABLE users RESTART IDENTITY;
```

С учетом связанных таблиц:

```sql
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
```

## JOIN

`INNER JOIN`: только строки, где связь найдена.

```sql
SELECT
  users.id,
  users.username,
  roles.name AS role
FROM users
INNER JOIN roles ON roles.id = users.role_id;
```

`LEFT JOIN`: все пользователи, даже если роли нет.

```sql
SELECT
  users.id,
  users.username,
  roles.name AS role
FROM users
LEFT JOIN roles ON roles.id = users.role_id;
```

`RIGHT JOIN`: все строки из правой таблицы.

```sql
SELECT *
FROM users
RIGHT JOIN roles ON roles.id = users.role_id;
```

`FULL JOIN`: все строки из обеих таблиц.

```sql
SELECT *
FROM users
FULL JOIN roles ON roles.id = users.role_id;
```

## GROUP BY

```sql
SELECT role_id, COUNT(*) AS users_count
FROM users
GROUP BY role_id;
```

С `JOIN`:

```sql
SELECT
  roles.name,
  COUNT(users.id) AS users_count
FROM roles
LEFT JOIN users ON users.role_id = roles.id
GROUP BY roles.id, roles.name;
```

## Агрегатные функции

```sql
COUNT(*)
COUNT(column)
SUM(amount)
AVG(amount)
MIN(amount)
MAX(amount)
```

Пример:

```sql
SELECT
  COUNT(*) AS total,
  MIN(created_at) AS first_created,
  MAX(created_at) AS last_created
FROM users;
```

## HAVING

`WHERE` фильтрует строки до группировки. `HAVING` фильтрует группы после `GROUP BY`.

```sql
SELECT role_id, COUNT(*) AS users_count
FROM users
GROUP BY role_id
HAVING COUNT(*) > 5;
```

## Подзапросы

```sql
SELECT *
FROM users
WHERE role_id = (
  SELECT id
  FROM roles
  WHERE name = 'admin'
);
```

```sql
SELECT *
FROM users
WHERE role_id IN (
  SELECT id
  FROM roles
  WHERE name IN ('user', 'admin')
);
```

## EXISTS

```sql
SELECT *
FROM roles
WHERE EXISTS (
  SELECT 1
  FROM users
  WHERE users.role_id = roles.id
);
```

## CTE / WITH

```sql
WITH admin_role AS (
  SELECT id
  FROM roles
  WHERE name = 'admin'
)
SELECT users.*
FROM users
INNER JOIN admin_role ON admin_role.id = users.role_id;
```

Несколько CTE:

```sql
WITH
  admin_role AS (
    SELECT id FROM roles WHERE name = 'admin'
  ),
  admins AS (
    SELECT * FROM users WHERE role_id = (SELECT id FROM admin_role)
  )
SELECT * FROM admins;
```

## UPSERT

Вставить, а если конфликт, ничего не делать:

```sql
INSERT INTO roles (name)
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;
```

Вставить, а если конфликт, обновить:

```sql
INSERT INTO users (username, role_id, password_hash)
VALUES ('admin', 1, 'hash')
ON CONFLICT (username)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash
RETURNING id, username;
```

`EXCLUDED` - строка, которую пытались вставить.

## ALTER TABLE

Добавить колонку:

```sql
ALTER TABLE users ADD COLUMN email TEXT;
```

Добавить с ограничением:

```sql
ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
```

Переименовать колонку:

```sql
ALTER TABLE users RENAME COLUMN password_hash TO password_digest;
```

Переименовать таблицу:

```sql
ALTER TABLE users RENAME TO app_users;
```

Изменить тип:

```sql
ALTER TABLE users
ALTER COLUMN username TYPE VARCHAR(255);
```

Сделать поле обязательным:

```sql
ALTER TABLE users
ALTER COLUMN username SET NOT NULL;
```

Убрать `NOT NULL`:

```sql
ALTER TABLE users
ALTER COLUMN username DROP NOT NULL;
```

Удалить колонку:

```sql
ALTER TABLE users DROP COLUMN email;
```

Добавить constraint:

```sql
ALTER TABLE roles
ADD CONSTRAINT roles_name_check CHECK (name IN ('user', 'admin'));
```

Удалить constraint:

```sql
ALTER TABLE roles
DROP CONSTRAINT roles_name_check;
```

## DROP

```sql
DROP TABLE users;
DROP TABLE IF EXISTS users;
DROP TABLE users CASCADE;
```

```sql
DROP DATABASE postgres_db;
DROP INDEX users_username_idx;
DROP VIEW users_with_roles;
```

## Индексы

Обычный индекс:

```sql
CREATE INDEX users_role_id_idx ON users(role_id);
```

Уникальный индекс:

```sql
CREATE UNIQUE INDEX users_username_idx ON users(username);
```

Составной индекс:

```sql
CREATE INDEX users_role_created_idx ON users(role_id, created_at);
```

Индекс для `ILIKE '%text%'` лучше делать через `pg_trgm`, но для демо часто можно не усложнять.

## Transactions

```sql
BEGIN;

UPDATE users
SET username = 'admin'
WHERE id = 1;

COMMIT;
```

Откатить:

```sql
BEGIN;

DELETE FROM users;

ROLLBACK;
```

## Параметризованные запросы в pg

Нельзя вставлять пользовательские данные строкой:

```ts
await pool.query(`SELECT * FROM users WHERE username = '${username}'`);
```

Нужно через `$1`, `$2`, `$3`:

```ts
await pool.query(
  "SELECT * FROM users WHERE username = $1",
  [username],
);
```

Несколько параметров:

```ts
await pool.query(
  "SELECT * FROM users WHERE username = $1 AND password_hash = $2",
  [username, passwordHash],
);
```

## RETURNING

PostgreSQL умеет возвращать строки после `INSERT`, `UPDATE`, `DELETE`.

```sql
INSERT INTO roles (name)
VALUES ('admin')
RETURNING id, name;
```

```sql
UPDATE users
SET username = 'new_admin'
WHERE id = 1
RETURNING id, username;
```

```sql
DELETE FROM users
WHERE id = 1
RETURNING id;
```

## CASE

```sql
SELECT
  username,
  CASE
    WHEN role_id = 1 THEN 'first_role'
    WHEN role_id = 2 THEN 'second_role'
    ELSE 'unknown'
  END AS role_label
FROM users;
```

## COALESCE и NULLIF

Первое не `NULL` значение:

```sql
SELECT COALESCE(username, 'Без имени') FROM users;
```

Вернуть `NULL`, если значения равны:

```sql
SELECT NULLIF(username, '') FROM users;
```

## Работа со строками

```sql
LOWER(username)
UPPER(username)
TRIM(username)
LENGTH(username)
CONCAT(first_name, ' ', last_name)
```

Примеры:

```sql
SELECT LOWER(username) FROM users;

SELECT *
FROM users
WHERE LOWER(username) = LOWER('Admin');
```

Конкатенация:

```sql
SELECT first_name || ' ' || last_name AS full_name
FROM users;
```

## Даты и время

```sql
SELECT NOW();
SELECT CURRENT_DATE;
SELECT CURRENT_TIME;
```

Прибавить время:

```sql
SELECT NOW() + INTERVAL '1 day';
SELECT NOW() - INTERVAL '2 hours';
```

Фильтр по дате:

```sql
SELECT *
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days';
```

Форматирование:

```sql
SELECT TO_CHAR(created_at, 'DD.MM.YYYY') FROM users;
```

## JSONB

Создание поля:

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  payload JSONB NOT NULL
);
```

Вставка:

```sql
INSERT INTO events (payload)
VALUES ('{"type": "login", "userId": 1}'::JSONB);
```

Чтение:

```sql
SELECT payload->'type' FROM events;   -- JSON
SELECT payload->>'type' FROM events;  -- TEXT
```

Фильтр:

```sql
SELECT *
FROM events
WHERE payload->>'type' = 'login';
```

Проверка наличия ключа:

```sql
SELECT *
FROM events
WHERE payload ? 'type';
```

## Arrays

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  tags TEXT[] NOT NULL DEFAULT '{}'
);
```

Вставка:

```sql
INSERT INTO posts (tags)
VALUES (ARRAY['react', 'postgres']);
```

Содержит элемент:

```sql
SELECT *
FROM posts
WHERE 'react' = ANY(tags);
```

Массив содержит значения:

```sql
SELECT *
FROM posts
WHERE tags @> ARRAY['react'];
```

## Window functions

Нумерация строк:

```sql
SELECT
  id,
  username,
  ROW_NUMBER() OVER (ORDER BY id) AS row_number
FROM users;
```

Ранг:

```sql
SELECT
  username,
  score,
  RANK() OVER (ORDER BY score DESC) AS rank
FROM users;
```

Агрегация по группе без схлопывания строк:

```sql
SELECT
  users.*,
  COUNT(*) OVER (PARTITION BY role_id) AS users_in_role
FROM users;
```

## Views

```sql
CREATE VIEW users_with_roles AS
SELECT
  users.id,
  users.username,
  roles.name AS role
FROM users
INNER JOIN roles ON roles.id = users.role_id;
```

Использование:

```sql
SELECT * FROM users_with_roles;
```

Удаление:

```sql
DROP VIEW users_with_roles;
```

## UUID

Подключить расширение:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Таблица с UUID:

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id)
);
```

## Enum

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'user'
);
```

Для простого демо чаще удобнее таблица `roles`, потому что ее можно связать foreign key.

## Полезные psql-команды

Это команды `psql`, не SQL.

```psql
\l                 -- список баз
\c postgres_db     -- подключиться к базе
\dt                -- список таблиц
\d users           -- описание таблицы
\du                -- список пользователей PostgreSQL
\q                 -- выйти
```

Запуск SQL-файла:

```psql
\i database/schema.sql
```

## Типовые запросы для проекта

Получить пользователей с ролями:

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

Создать пользователя с ролью `user`:

```sql
INSERT INTO users (username, role_id, password_hash)
SELECT 'student', roles.id, 'hash'
FROM roles
WHERE roles.name = 'user'
RETURNING id, username;
```

Проверить пользователя при авторизации:

```sql
SELECT
  users.id,
  users.username,
  roles.name AS role
FROM users
INNER JOIN roles ON roles.id = users.role_id
WHERE users.username = $1
  AND users.password_hash = $2
LIMIT 1;
```

Сделать пользователя админом:

```sql
UPDATE users
SET role_id = (
  SELECT id
  FROM roles
  WHERE name = 'admin'
)
WHERE username = 'student';
```

Удалить тестовых пользователей:

```sql
DELETE FROM users
WHERE username ILIKE 'test%';
```

## Оффтоп: расчет стоимости заказа по материалам

Задача: вычислить полную стоимость заказа покупателя с учетом:

- количества продукции в заказе
- стоимости материалов
- нормы расхода материала на одну единицу продукции

Условная схема:

```txt
orders
  id
  customer_id

order_items
  id
  order_id
  product_id
  quantity

products
  id
  name

materials
  id
  name
  price

product_materials
  product_id
  material_id
  consumption_rate
```

`consumption_rate` - сколько материала нужно на 1 единицу продукции.

Формула:

```txt
стоимость = количество продукции * норма расхода материала * цена материала
```

Итоговая стоимость материалов по конкретному заказу:

```sql
SELECT
  orders.id AS order_id,
  COALESCE(
    SUM(order_items.quantity * product_materials.consumption_rate * materials.price),
    0
  ) AS total_order_cost
FROM orders
INNER JOIN order_items ON order_items.order_id = orders.id
LEFT JOIN product_materials ON product_materials.product_id = order_items.product_id
LEFT JOIN materials ON materials.id = product_materials.material_id
WHERE orders.id = $1
GROUP BY orders.id;
```

Детализация по продукции внутри заказа:

```sql
SELECT
  orders.id AS order_id,
  products.id AS product_id,
  products.name AS product_name,
  order_items.quantity,
  COALESCE(
    SUM(product_materials.consumption_rate * materials.price),
    0
  ) AS material_cost_per_one_product,
  COALESCE(
    order_items.quantity * SUM(product_materials.consumption_rate * materials.price),
    0
  ) AS total_product_cost
FROM orders
INNER JOIN order_items ON order_items.order_id = orders.id
INNER JOIN products ON products.id = order_items.product_id
LEFT JOIN product_materials ON product_materials.product_id = products.id
LEFT JOIN materials ON materials.id = product_materials.material_id
WHERE orders.id = $1
GROUP BY
  orders.id,
  products.id,
  products.name,
  order_items.quantity;
```

Детализация по каждому материалу:

```sql
SELECT
  orders.id AS order_id,
  products.name AS product_name,
  materials.name AS material_name,
  order_items.quantity AS product_quantity,
  product_materials.consumption_rate,
  materials.price AS material_price,
  order_items.quantity * product_materials.consumption_rate AS total_material_amount,
  order_items.quantity * product_materials.consumption_rate * materials.price AS total_material_cost
FROM orders
INNER JOIN order_items ON order_items.order_id = orders.id
INNER JOIN products ON products.id = order_items.product_id
INNER JOIN product_materials ON product_materials.product_id = products.id
INNER JOIN materials ON materials.id = product_materials.material_id
WHERE orders.id = $1
ORDER BY products.name, materials.name;
```

Итоговая стоимость всех заказов конкретного покупателя:

```sql
SELECT
  orders.customer_id,
  COALESCE(
    SUM(order_items.quantity * product_materials.consumption_rate * materials.price),
    0
  ) AS customer_orders_total_cost
FROM orders
INNER JOIN order_items ON order_items.order_id = orders.id
LEFT JOIN product_materials ON product_materials.product_id = order_items.product_id
LEFT JOIN materials ON materials.id = product_materials.material_id
WHERE orders.customer_id = $1
GROUP BY orders.customer_id;
```
