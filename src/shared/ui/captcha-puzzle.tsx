import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

const defaultImages = [
  "/captcha/1.png",
  "/captcha/2.png",
  "/captcha/3.png",
  "/captcha/4.png",
] as const;

/** Один фрагмент изображения для CaptchaPuzzle. */
export interface CaptchaPiece {
  /** Порядковый номер фрагмента в правильном решении. */
  id: number;
  /** URL или data-uri изображения фрагмента. */
  src: string;
}

/** Props для каптчи, где 4 фрагмента нужно отсортировать внутри квадратной сетки. */
export interface CaptchaPuzzleProps {
  /** Массив из 4 изображений. По умолчанию используются `/captcha/1.png`...`/captcha/4.png`. */
  images?: readonly string[];
  /** Заголовок блока каптчи. По умолчанию "Каптча". */
  title?: string;
  /** Показывать ли кнопку продолжения после успешного решения. */
  hasContinueButton?: boolean;
  /** Вызывается один раз, когда фрагменты впервые собраны правильно. */
  onSuccess?: () => void;
  /** Вызывается, если после успешного состояния порядок снова стал неверным. */
  onFail?: () => void;
  /** Вызывается по клику на кнопку продолжения. */
  onContinue?: () => void;
}

interface SortablePieceProps {
  piece: CaptchaPiece;
  isSolved: boolean;
}

function shuffleArray<T>(items: T[]) {
  if (items.length <= 1) {
    return [...items];
  }

  let nextItems = [...items];
  let isSameAsOriginal = true;

  while (isSameAsOriginal) {
    nextItems = [...items];

    for (let index = nextItems.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [nextItems[index], nextItems[randomIndex]] = [
        nextItems[randomIndex],
        nextItems[index],
      ];
    }

    isSameAsOriginal = nextItems.every((item, index) => item === items[index]);
  }

  return nextItems;
}

function createPieces(images: readonly string[]) {
  return images.map((src, index) => ({ id: index, src }));
}

function SortablePiece({ isSolved, piece }: SortablePieceProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: piece.id, disabled: isSolved });

  const style = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`Фрагмент ${piece.id + 1}`}
      disabled={isSolved}
      className={cn(
        "relative size-full overflow-hidden bg-white touch-none select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700",
        isSolved ? "cursor-default" : "cursor-grab active:cursor-grabbing",
      )}
      style={style}
      {...attributes}
      {...listeners}
    >
      <img
        src={piece.src}
        alt={`Фрагмент ${piece.id + 1}`}
        className="pointer-events-none size-full object-cover"
        draggable={false}
      />
    </button>
  );
}

export function CaptchaPuzzle({
  hasContinueButton,
  images = defaultImages,
  onContinue,
  onFail,
  onSuccess,
  title = "Каптча",
}: CaptchaPuzzleProps) {
  const imageKey = JSON.stringify(images);
  const imageSources = useMemo(() => [...images], [imageKey]);
  const hasValidImages = imageSources.length === 4;
  const previousImageKeyRef = useRef(imageKey);
  const [pieces, setPieces] = useState<CaptchaPiece[]>(() =>
    shuffleArray(createPieces(imageSources)),
  );
  const [wasSolved, setWasSolved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const isSolved = useMemo(
    () =>
      hasValidImages &&
      pieces.length === 4 &&
      pieces.every((piece, index) => piece.id === index),
    [hasValidImages, pieces],
  );

  useEffect(() => {
    if (previousImageKeyRef.current === imageKey) {
      return;
    }

    previousImageKeyRef.current = imageKey;
    setPieces(shuffleArray(createPieces(imageSources)));
    setWasSolved(false);
  }, [imageKey, imageSources]);

  useEffect(() => {
    if (isSolved && !wasSolved) {
      setWasSolved(true);
      onSuccess?.();
      return;
    }

    if (!isSolved && wasSolved) {
      setWasSolved(false);
      onFail?.();
    }
  }, [isSolved, onFail, onSuccess, wasSolved]);

  function reset() {
    setPieces(shuffleArray(createPieces(imageSources)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || isSolved) {
      return;
    }

    setPieces((currentPieces) => {
      const oldIndex = currentPieces.findIndex((piece) => piece.id === active.id);
      const newIndex = currentPieces.findIndex((piece) => piece.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return currentPieces;
      }

      return arrayMove(currentPieces, oldIndex, newIndex);
    });
  }

  if (!hasValidImages) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
        Компонент ожидает ровно 4 изображения.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
          <p className="text-sm text-zinc-500">
            {isSolved
              ? "Изображение собрано верно."
              : "Поменяйте фрагменты местами, чтобы собрать картинку."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" />
          Сбросить
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pieces.map((piece) => piece.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={cn(
              "grid aspect-square w-full max-w-[300px] grid-cols-2 gap-1 overflow-hidden rounded-md border-4 bg-zinc-50 transition-colors duration-300",
              isSolved ? "border-emerald-300" : "border-zinc-600",
            )}
          >
            {pieces.map((piece) => (
              <SortablePiece key={piece.id} piece={piece} isSolved={isSolved} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {hasContinueButton && (
        <div className="h-10">
          {isSolved && (
            <Button variant="outline" onClick={onContinue}>
              Продолжить
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
