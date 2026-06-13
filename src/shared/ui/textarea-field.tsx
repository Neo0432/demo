import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

/** Props для многострочного поля с label, подсказкой и ошибкой. */
export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  /** Явный id для textarea. Если не передан, компонент сгенерирует id сам. */
  id?: string;
  /** Подпись поля, связанная с textarea через `htmlFor`. */
  label: string;
  /** Текст-подсказка под полем. Не показывается, если передан `error`. */
  hint?: string;
  /** Текст ошибки под полем. Также включает `aria-invalid`. */
  error?: string;
}

export function TextareaField({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={textareaId} className="text-sm font-medium text-zinc-900">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "min-h-28 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm transition",
          "placeholder:text-zinc-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15",
          "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
          error && "border-rose-400 focus:border-rose-600 focus:ring-rose-600/15",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
