import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

export interface CaptchaPiece {
  id: string;
  src: string;
  alt: string;
  correctSlot: 0 | 1 | 2 | 3;
}

export interface CaptchaPuzzleProps {
  pieces: CaptchaPiece[];
  title?: string;
  onSolvedChange?: (solved: boolean) => void;
}

function shuffle(items: string[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

export function CaptchaPuzzle({
  onSolvedChange,
  pieces,
  title = "Каптча",
}: CaptchaPuzzleProps) {
  const pieceKey = pieces.map((piece) => piece.id).join("|");
  const [slots, setSlots] = useState<Array<string | null>>([null, null, null, null]);
  const [tray, setTray] = useState(() => shuffle(pieces.map((piece) => piece.id)));
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const pieceById = useMemo(
    () => new Map(pieces.map((piece) => [piece.id, piece])),
    [pieces],
  );

  const isComplete = slots.every(Boolean);
  const isSolved =
    isComplete &&
    slots.every((pieceId, slotIndex) => {
      if (!pieceId) {
        return false;
      }

      return pieceById.get(pieceId)?.correctSlot === slotIndex;
    });

  useEffect(() => {
    onSolvedChange?.(isSolved);
  }, [isSolved, onSolvedChange]);

  useEffect(() => {
    setSlots([null, null, null, null]);
    setTray(shuffle(pieces.map((piece) => piece.id)));
    setSelectedPiece(null);
    setDraggedPiece(null);
  }, [pieceKey]);

  if (pieces.length !== 4) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
        Компонент ожидает ровно 4 изображения.
      </div>
    );
  }

  function reset() {
    setSlots([null, null, null, null]);
    setTray(shuffle(pieces.map((piece) => piece.id)));
    setSelectedPiece(null);
    setDraggedPiece(null);
  }

  function movePiece(pieceId: string, targetSlot: number | null) {
    const slotsWithoutPiece = slots.map((currentPieceId) =>
      currentPieceId === pieceId ? null : currentPieceId,
    );
    const displacedPiece = targetSlot === null ? null : slotsWithoutPiece[targetSlot];
    const nextSlots = [...slotsWithoutPiece];

    if (targetSlot !== null) {
      nextSlots[targetSlot] = pieceId;
    }

    const withoutMovedPieces = tray.filter(
      (currentPieceId) =>
        currentPieceId !== pieceId && currentPieceId !== displacedPiece,
    );
    const nextTray =
      targetSlot === null
        ? [...withoutMovedPieces, pieceId]
        : displacedPiece
          ? [...withoutMovedPieces, displacedPiece]
          : withoutMovedPieces;

    setSlots(nextSlots);
    setTray(unique(nextTray));
    setSelectedPiece(null);
  }

  function handleDragStart(event: DragEvent, pieceId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pieceId);
    setDraggedPiece(pieceId);
  }

  function handleDrop(event: DragEvent, targetSlot: number | null) {
    event.preventDefault();
    const pieceId = event.dataTransfer.getData("text/plain") || draggedPiece;

    if (pieceId) {
      movePiece(pieceId, targetSlot);
    }

    setDraggedPiece(null);
  }

  function handleSlotClick(slotIndex: number) {
    const pieceId = slots[slotIndex];

    if (selectedPiece) {
      movePiece(selectedPiece, slotIndex);
      return;
    }

    if (pieceId) {
      setSelectedPiece(pieceId);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
          <p className="text-sm text-zinc-500">
            {isSolved
              ? "Изображение собрано верно."
              : isComplete
                ? "Порядок фрагментов пока неверный."
                : "Перетащите фрагменты в квадрат."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" />
          Сбросить
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,320px),1fr]">
        <div className="grid aspect-square grid-cols-2 overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100">
          {[0, 1, 2, 3].map((slotIndex) => {
            const pieceId = slots[slotIndex];
            const piece = pieceId ? pieceById.get(pieceId) : null;

            return (
              <button
                key={slotIndex}
                type="button"
                aria-label={`Ячейка ${slotIndex + 1}`}
                onClick={() => handleSlotClick(slotIndex)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, slotIndex)}
                className={cn(
                  "relative aspect-square border-zinc-300 bg-white/80 transition",
                  slotIndex === 0 && "border-b border-r",
                  slotIndex === 1 && "border-b",
                  slotIndex === 2 && "border-r",
                  selectedPiece && "hover:bg-teal-50",
                )}
              >
                {piece ? (
                  <img
                    draggable
                    src={piece.src}
                    alt={piece.alt}
                    onDragStart={(event) => handleDragStart(event, piece.id)}
                    className={cn(
                      "size-full object-cover",
                      selectedPiece === piece.id && "ring-4 ring-inset ring-teal-600",
                    )}
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-xs font-medium text-zinc-400">
                    {slotIndex + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, null)}
          className="grid content-start gap-3 rounded-lg border border-dashed border-zinc-300 bg-white p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Фрагменты
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {tray.map((pieceId) => {
              const piece = pieceById.get(pieceId);

              if (!piece) {
                return null;
              }

              return (
                <button
                  key={piece.id}
                  type="button"
                  draggable
                  onClick={() =>
                    setSelectedPiece((current) =>
                      current === piece.id ? null : piece.id,
                    )
                  }
                  onDragStart={(event) => handleDragStart(event, piece.id)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm transition",
                    "hover:border-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
                    selectedPiece === piece.id && "border-teal-700 ring-2 ring-teal-700/20",
                  )}
                >
                  <img src={piece.src} alt={piece.alt} className="size-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
