import { X } from "lucide-react";
import { useEffect, useId } from "react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

import { Button } from "./button";

/** Props для модального окна с оверлеем, заголовком и footer-зоной. */
export interface ModalProps {
  /** Содержимое основной области модального окна. */
  children?: ReactNode;
  /** Открыто ли модальное окно. */
  open: boolean;
  /** Заголовок модального окна. */
  title: string;
  /** Краткое описание под заголовком. */
  description?: string;
  /** Нижняя зона для действий, например кнопок "Отмена" и "Сохранить". */
  footer?: ReactNode;
  /** Вызывается при открытии или закрытии модального окна. */
  onOpenChange: (open: boolean) => void;
}

export function Modal({
  children,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl",
          "max-h-[calc(100vh-2rem)] overflow-y-auto",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h2 id={titleId} className="text-xl font-semibold text-zinc-950">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm leading-6 text-zinc-600">
                {description}
              </p>
            )}
          </div>
          <Button
            aria-label="Закрыть окно"
            size="icon"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
