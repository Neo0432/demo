import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CaptchaPuzzle } from "@shared/ui/captcha-puzzle";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { DataTable } from "@shared/ui/data-table";
import { DatePicker } from "@shared/ui/date-picker";
import { InputField } from "@shared/ui/input-field";
import { Modal } from "@shared/ui/modal";
import { PasswordField } from "@shared/ui/password-field";
import { SelectField } from "@shared/ui/select-field";
import { SwitchField } from "@shared/ui/switch-field";
import { TextareaField } from "@shared/ui/textarea-field";
import { PageTitle, SectionHeading, Text } from "@shared/ui/typography";

import type { DatabaseUser } from "./model/database-user";
import { demoOrders } from "./model/demo-orders";
import type { DemoOrder } from "./model/demo-orders";

const roleOptions = [
  { value: "admin", label: "Администратор" },
  { value: "manager", label: "Менеджер" },
  { value: "student", label: "Студент" },
];

const statusTone: Record<
  DemoOrder["status"],
  "info" | "success" | "warning" | "danger"
> = {
  blocked: "danger",
  done: "success",
  new: "info",
  processing: "warning",
};

const statusLabel: Record<DemoOrder["status"], string> = {
  blocked: "Заблокирован",
  done: "Готово",
  new: "Новый",
  processing: "В работе",
};

const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  currency: "RUB",
  style: "currency",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

interface HomePageProps {
  users: DatabaseUser[];
  usersError: string | null;
}

export function HomePage({ users, usersError }: HomePageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState("manager");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2026, 5, 14),
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const columns = useMemo<Array<ColumnDef<DemoOrder>>>(
    () => [
      {
        accessorKey: "id",
        header: "Номер",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-950">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "client",
        header: "Клиент",
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => (
          <Badge tone={statusTone[row.original.status]}>
            {statusLabel[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: "Сумма",
        cell: ({ row }) => currencyFormatter.format(row.original.amount),
      },
      {
        accessorKey: "createdAt",
        header: "Дата",
        cell: ({ row }) =>
          dateFormatter.format(new Date(row.original.createdAt)),
      },
    ],
    [],
  );

  const userColumns = useMemo<Array<ColumnDef<DatabaseUser>>>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-950">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge tone={row.original.role === "admin" ? "danger" : "neutral"}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "passwordHash",
        header: "Password hash",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-zinc-700">
            {row.original.passwordHash}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-zinc-950">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <PageTitle
          eyebrow="Стартовый проект"
          title="UI-kit для демо-экзамена"
          action={
            <>
              <Button variant="outline">
                <Download className="size-4" />
                Экспорт
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="size-4" />
                Создать
              </Button>
            </>
          }
        >
          Основа приложения: формы, таблицы, календарь, select, модалки, клиент
          для запросов к БД и каптча из четырех фрагментов.
        </PageTitle>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Кнопки и статусы">
            Базовые действия, состояния загрузки и компактные бейджи.
          </SectionHeading>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Save className="size-4" />
              Сохранить
            </Button>
            <Button variant="secondary">
              <Send className="size-4" />
              Отправить
            </Button>
            <Button variant="outline">
              <CalendarDays className="size-4" />
              Запланировать
            </Button>
            <Button variant="ghost">
              <CheckCircle2 className="size-4" />
              Проверить
            </Button>
            <Button variant="danger">
              <Trash2 className="size-4" />
              Удалить
            </Button>
            <Button isLoading>Загрузка</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Новый</Badge>
            <Badge tone="warning">В работе</Badge>
            <Badge tone="success">Готово</Badge>
            <Badge tone="danger">Ошибка</Badge>
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Форма">
            Поля ввода, textarea, react-select, переключатель и
            react-day-picker.
          </SectionHeading>
          <div className="grid gap-5 lg:grid-cols-[1fr,340px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Поиск"
                placeholder="Номер, клиент, статус"
                leftIcon={<Search className="size-4" />}
              />
              <InputField
                label="Email"
                type="email"
                placeholder="student@example.com"
                hint="Используется для уведомлений."
              />
              <InputField
                label="Стоимость"
                type="number"
                placeholder="15000"
                rightAddon="RUB"
              />
              <PasswordField
                label="Пароль"
                placeholder="Введите пароль"
              />
              <SelectField
                label="Роль"
                options={roleOptions}
                value={role}
                onChange={setRole}
              />
              <div className="sm:col-span-2">
                <TextareaField
                  label="Комментарий"
                  placeholder="Короткое описание заявки"
                  hint="Можно использовать для заметок оператора."
                />
              </div>
              <div className="sm:col-span-2 rounded-lg border border-zinc-200 p-4">
                <SwitchField
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  label="Уведомления"
                  hint="Показывает типовой бинарный контрол."
                />
              </div>
            </div>
            <DatePicker selected={selectedDate} onSelect={setSelectedDate} />
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading
            title="Таблица"
            action={
              <Button variant="outline" size="sm">
                <Download className="size-4" />
                CSV
              </Button>
            }
          >
            TanStack Table с сортировкой по заголовкам.
          </SectionHeading>
          <DataTable columns={columns} data={demoOrders} />
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Пользователи из БД">
            SELECT id, username, role, "passwordHash" FROM users
          </SectionHeading>
          {usersError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
              {usersError}
            </div>
          )}
          <DataTable
            columns={userColumns}
            data={users}
            emptyText="Пользователей нет"
          />
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading
            title="Каптча"
            action={
              <Badge tone={captchaSolved ? "success" : "neutral"}>
                {captchaSolved ? "Пройдена" : "Не пройдена"}
              </Badge>
            }
          >
            Компонент принимает 4 изображения и сортирует их внутри сетки.
          </SectionHeading>
          <CaptchaPuzzle
            title="Соберите картинку"
            onSuccess={() => setCaptchaSolved(true)}
            onFail={() => setCaptchaSolved(false)}
          />
        </section>

        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <SectionHeading title="Запросы к базе данных">
            Пул подключений PostgreSQL лежит в app/db.ts.
          </SectionHeading>
          <Text>
            Используйте pg только в серверном коде React Router: loader, action
            или отдельном backend/API. Внутрь React-компонентов pool
            импортировать нельзя.
          </Text>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-50">
            <code>{`import { pool } from "@app/db";

const result = await pool.query(
  "SELECT id, name, email FROM users LIMIT 10",
);

const users = result.rows;`}</code>
          </pre>
        </section>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Новая запись"
        description="Пример базового модального окна с формой."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              <Save className="size-4" />
              Сохранить
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <InputField label="Название" placeholder="Например, заявка клиента" />
          <SelectField
            label="Ответственный"
            options={roleOptions}
            value={role}
            onChange={setRole}
          />
        </div>
      </Modal>
    </main>
  );
}
