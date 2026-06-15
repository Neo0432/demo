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
import { useEffect, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

const defaultImages = [
  "/captcha/1.png",
  "/captcha/2.png",
  "/captcha/3.png",
  "/captcha/4.png",
] as const;

const defaultSolutionOrder = [0, 1, 2, 3] as const;

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
  /** Правильный порядок id фрагментов. По умолчанию `[0, 1, 2, 3]`. */
  solutionOrder?: readonly number[];
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

function createPieces(images: readonly string[]) {
  return images.map((src, index) => ({ id: index, src }));
}

function checkSolution(
  pieces: CaptchaPiece[],
  solutionOrder: readonly number[],
) {
  return (
    pieces.length === solutionOrder.length &&
    pieces.every((piece, index) => piece.id === solutionOrder[index])
  );
}

function createSolvedPieces(
  images: readonly string[],
  solutionOrder: readonly number[],
) {
  const pieces = createPieces(images);
  const piecesById = new Map(pieces.map((piece) => [piece.id, piece]));

  if (solutionOrder.length !== pieces.length) {
    return pieces;
  }

  const solvedPieces = solutionOrder
    .map((id) => piecesById.get(id))
    .filter((piece): piece is CaptchaPiece => Boolean(piece));

  return solvedPieces.length === pieces.length ? solvedPieces : pieces;
}

function createFallbackUnsolvedPieces(
  images: readonly string[],
  solutionOrder: readonly number[],
) {
  const pieces = createSolvedPieces(images, solutionOrder);

  if (pieces.length < 2) {
    return pieces;
  }

  const nextPieces = [...pieces];

  [nextPieces[0], nextPieces[1]] = [nextPieces[1], nextPieces[0]];

  if (nextPieces.length > 3) {
    [nextPieces[2], nextPieces[3]] = [nextPieces[3], nextPieces[2]];
  }

  return nextPieces;
}

function generateUnsolvedPieces(
  images: readonly string[],
  solutionOrder: readonly number[],
  options: { randomize?: boolean } = {},
) {
  const basePieces = createPieces(images);

  if (basePieces.length !== solutionOrder.length || basePieces.length < 2) {
    return basePieces;
  }

  if (!options.randomize) {
    return createFallbackUnsolvedPieces(images, solutionOrder);
  }

  let shuffledPieces = shuffleArray(basePieces);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (!checkSolution(shuffledPieces, solutionOrder)) {
      return shuffledPieces;
    }

    shuffledPieces = shuffleArray(basePieces);
  }

  return createFallbackUnsolvedPieces(images, solutionOrder);
}

function areArraysEqual<T>(left: readonly T[], right: readonly T[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
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
      {...(isSolved ? {} : attributes)}
      {...(isSolved ? {} : listeners)}
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
  solutionOrder = defaultSolutionOrder,
  title = "Каптча",
}: CaptchaPuzzleProps) {
  const hasValidImages = images.length === 4;
  const previousConfigRef = useRef({
    images: [...images],
    solutionOrder: [...solutionOrder],
  });
  const [pieces, setPieces] = useState<CaptchaPiece[]>(() =>
    generateUnsolvedPieces(images, solutionOrder),
  );
  const [isSolved, setIsSolved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const previousConfig = previousConfigRef.current;
    const isSameConfig =
      areArraysEqual(previousConfig.images, images) &&
      areArraysEqual(previousConfig.solutionOrder, solutionOrder);

    if (isSameConfig) {
      return;
    }

    previousConfigRef.current = {
      images: [...images],
      solutionOrder: [...solutionOrder],
    };

    setPieces(
      generateUnsolvedPieces(images, solutionOrder, { randomize: true }),
    );
    setIsSolved(false);
    onFail?.();
  }, [images, onFail, solutionOrder]);

  function reset() {
    setPieces(
      generateUnsolvedPieces(images, solutionOrder, { randomize: true }),
    );
    setIsSolved(false);
    onFail?.();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || isSolved) {
      return;
    }

    const oldIndex = pieces.findIndex((piece) => piece.id === active.id);
    const newIndex = pieces.findIndex((piece) => piece.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextPieces = arrayMove(pieces, oldIndex, newIndex);
    const nextIsSolved = checkSolution(nextPieces, solutionOrder);

    setPieces(nextPieces);

    if (nextIsSolved) {
      setIsSolved(true);
      onSuccess?.();
    }
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
        <Button
          variant="outline"
          size="sm"
          disabled={isSolved}
          onClick={reset}
        >
          <RotateCcw className="size-4" />
          Сбросить
        </Button>
      </div>

      <DndContext
        sensors={isSolved ? [] : sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            "grid aspect-square w-full max-w-[300px] grid-cols-2 gap-1 overflow-hidden rounded-md border-4 bg-zinc-50 transition-colors duration-300",
            isSolved ? "border-emerald-300" : "border-zinc-600",
          )}
        >
          <SortableContext
            items={pieces.map((piece) => piece.id)}
            strategy={rectSortingStrategy}
          >
            {pieces.map((piece) => (
              <SortablePiece key={piece.id} piece={piece} isSolved={isSolved} />
            ))}
          </SortableContext>
        </div>
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
