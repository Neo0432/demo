# Каптча

Компонент каптчи лежит в `src/shared/ui/captcha-puzzle.tsx`.

Он принимает 4 изображения и показывает их в сетке `2 x 2`. Пользователь перетаскивает фрагменты через drag-and-drop, пока порядок фрагментов не станет правильным.

## Где используется

На главном экране компонент монтируется в `src/pages/home/home-page.tsx`:

```tsx
<CaptchaPuzzle
  title="Соберите картинку"
  onSuccess={handleCaptchaSuccess}
  onFail={handleCaptchaFail}
/>
```

`HomePage` хранит внешнее состояние `captchaSolved`, чтобы показать бейдж `Пройдена / Не пройдена` в заголовке секции.

## Изображения по умолчанию

Если не передать `images`, компонент использует файлы из `public/captcha`:

```ts
const defaultImages = [
  "/captcha/1.png",
  "/captcha/2.png",
  "/captcha/3.png",
  "/captcha/4.png",
];
```

Порядок массива важен: каждому изображению присваивается `id` по индексу.

```ts
function createPieces(images: readonly string[]) {
  return images.map((src, index) => ({ id: index, src }));
}
```

То есть:

- `/captcha/1.png` получает `id: 0`
- `/captcha/2.png` получает `id: 1`
- `/captcha/3.png` получает `id: 2`
- `/captcha/4.png` получает `id: 3`

## Правильное решение

По умолчанию правильный порядок такой:

```ts
const defaultSolutionOrder = [0, 1, 2, 3];
```

Компонент считает каптчу решенной, если текущий порядок фрагментов совпадает с `solutionOrder`:

```ts
function checkSolution(
  pieces: CaptchaPiece[],
  solutionOrder: readonly number[],
) {
  return (
    pieces.length === solutionOrder.length &&
    pieces.every((piece, index) => piece.id === solutionOrder[index])
  );
}
```

Если изображения нарезаны в другом порядке, можно передать свой `solutionOrder`:

```tsx
<CaptchaPuzzle solutionOrder={[0, 1, 3, 2]} />
```

## Drag-and-drop

Drag-and-drop сделан через `@dnd-kit`:

- `DndContext` включает общий dnd-контекст
- `SortableContext` хранит порядок sortable-элементов
- `useSortable` подключает каждый фрагмент к drag-and-drop
- `arrayMove` меняет порядок массива после drop

Начальный порядок фрагментов сделан детерминированным:

```ts
const [pieces, setPieces] = useState<CaptchaPiece[]>(() =>
  generateUnsolvedPieces(images, solutionOrder),
);
```

Это важно для React Router в серверном режиме. Если вызвать случайный `shuffleArray` прямо в `useState` initializer, сервер может отрендерить один порядок, а браузер при hydration получить другой.

`generateUnsolvedPieces` без `randomize` возвращает предсказуемый нерешенный порядок. При ручном сбросе можно безопасно перемешать уже на клиенте:

```ts
function reset() {
  setPieces(generateUnsolvedPieces(images, solutionOrder, { randomize: true }));
  setIsSolved(false);
  onFail?.();
}
```

`shuffleArray` - обычный Fisher-Yates без бесконечного цикла:

```ts
function shuffleArray<T>(items: readonly T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [
      nextItems[randomIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}
```

Если `images` или `solutionOrder` поменялись, компонент сравнивает массивы по значениям, а не через `JSON.stringify`:

```ts
function areArraysEqual<T>(left: readonly T[], right: readonly T[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
}
```

При завершении перетаскивания вызывается `handleDragEnd`:

```ts
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over || active.id === over.id || isSolved) {
    return;
  }

  const oldIndex = pieces.findIndex((piece) => piece.id === active.id);
  const newIndex = pieces.findIndex((piece) => piece.id === over.id);

  const nextPieces = arrayMove(pieces, oldIndex, newIndex);
  const nextIsSolved = checkSolution(nextPieces, solutionOrder);

  setPieces(nextPieces);

  if (nextIsSolved) {
    setIsSolved(true);
    onSuccess?.();
  }
}
```

## Что происходит после решения

Когда порядок стал правильным:

- `isSolved` становится `true`
- вызывается `onSuccess`
- рамка сетки становится зеленой
- drag-and-drop отключается
- фрагменты получают `disabled`
- кнопка `Сбросить` блокируется

Отключение сделано в нескольких местах:

```tsx
<DndContext sensors={isSolved ? [] : sensors}>
```

```ts
useSortable({ id: piece.id, disabled: isSolved });
```

```tsx
disabled={isSolved}
```

Это нужно, чтобы после успешной сборки пользователь не мог случайно сдвинуть фрагменты обратно.

## Сброс

Кнопка `Сбросить` заново перемешивает фрагменты:

```ts
function reset() {
  setPieces(generateUnsolvedPieces(images, solutionOrder, { randomize: true }));
  setIsSolved(false);
  onFail?.();
}
```

После успешного решения кнопка сброса заблокирована.

## Частые причины багов

Если каптча визуально собрана, но не становится зеленой, проверь:

- правильный ли порядок файлов в `images`
- соответствует ли `solutionOrder` реальному порядку фрагментов
- не передается ли новый `key` в `CaptchaPuzzle`, из-за которого компонент ремоунтится
- не меняется ли массив `images` на каждом render
- не сбрасывает ли родительский компонент состояние после `onSuccess`

В текущем главном экране callbacks для `onSuccess` и `onFail` обернуты в `useCallback`, чтобы место монтирования не создавало новые функции на каждый render.
