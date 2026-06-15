# UI-kit

UI-kit лежит в `src/shared/ui`. Компоненты сделаны небольшими и независимыми, чтобы их можно было быстро использовать на страницах демо-проекта.

## Список компонентов

- `Badge`
- `Button`
- `CaptchaPuzzle`
- `DataTable`
- `DatePicker`
- `InputField`
- `Modal`
- `PasswordField`
- `SelectField`
- `SwitchField`
- `TextareaField`
- `PageTitle`
- `SectionHeading`
- `Text`

## Описание компонентов

### Badge

Файл: `src/shared/ui/badge.tsx`

Компактный бейдж для статусов и коротких пометок. Поддерживает цветовые тона: `neutral`, `success`, `warning`, `danger`, `info`.

### Button

Файл: `src/shared/ui/button.tsx`

Базовая кнопка проекта. Поддерживает варианты `primary`, `secondary`, `outline`, `ghost`, `danger`, размеры `sm`, `md`, `lg`, `icon`, а также состояние `isLoading`.

### CaptchaPuzzle

Файл: `src/shared/ui/captcha-puzzle.tsx`

Каптча-пазл на базе `@dnd-kit`. Принимает 4 изображения и позволяет отсортировать их внутри квадратной сетки 2x2. При правильной сборке вызывает `onSuccess`, при возврате в неправильное состояние - `onFail`.

### DataTable

Файл: `src/shared/ui/data-table.tsx`

Таблица на базе TanStack Table. Принимает `columns` и `data`, поддерживает сортировку по колонкам и пустое состояние через `emptyText`.

### DatePicker

Файл: `src/shared/ui/date-picker.tsx`

Одиночный выбор даты на базе `react-day-picker`. Работает как управляемый компонент через `selected` и `onSelect`.

### InputField

Файл: `src/shared/ui/input-field.tsx`

Базовое поле ввода с `label`, подсказкой `hint`, ошибкой `error`, левой иконкой `leftIcon` и правым addon-элементом `rightAddon`.

### Modal

Файл: `src/shared/ui/modal.tsx`

Модальное окно с overlay, заголовком, описанием, основной областью и footer-зоной. Управляется через `open` и `onOpenChange`. Закрывается по клику на overlay и по `Escape`.

### PasswordField

Файл: `src/shared/ui/password-field.tsx`

Поле пароля с переключателем видимости. Поддерживает `label`, `hint`, `error`, `leftIcon` и стандартные props input, кроме `type`.

### SelectField

Файл: `src/shared/ui/select-field.tsx`

Select на базе `react-select`. Принимает список опций `{ value, label }`, текущее значение `value` и обработчик `onChange`.

### SwitchField

Файл: `src/shared/ui/switch-field.tsx`

Переключатель для boolean-настроек. Управляется через `checked` и `onCheckedChange`, поддерживает `label` и `hint`.

### TextareaField

Файл: `src/shared/ui/textarea-field.tsx`

Многострочное поле с `label`, подсказкой `hint` и ошибкой `error`.

### PageTitle

Файл: `src/shared/ui/typography.tsx`

Главный заголовок страницы. Поддерживает `title`, верхнюю подпись `eyebrow`, описание через `children` и правую зону действий `action`.

### SectionHeading

Файл: `src/shared/ui/typography.tsx`

Заголовок секции. Поддерживает `title`, описание через `children` и правую зону действий `action`.

### Text

Файл: `src/shared/ui/typography.tsx`

Базовый текстовый абзац с единым стилем для описаний и вспомогательного текста.
