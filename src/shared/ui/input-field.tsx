import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

/** Props для текстового поля с label, подсказкой, ошибкой и addon-элементами. */
export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Явный id для input. Если не передан, компонент сгенерирует id сам. */
  id?: string;
  /** Подпись поля, связанная с input через `htmlFor`. */
  label: string;
  /** Текст-подсказка под полем. Не показывается, если передан `error`. */
  hint?: string;
  /** Текст ошибки под полем. Также включает `aria-invalid`. */
  error?: string;
  /** Иконка слева внутри поля. Обычно используется lucide-icon размером `size-4`. */
  leftIcon?: ReactNode;
  /** Короткий элемент справа внутри поля, например валюта или единица измерения. */
  rightAddon?: ReactNode;
}

export function InputField({
  className,
  error,
  hint,
  id,
  label,
  leftIcon,
  rightAddon,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-900">
        {label}
      </label>
      <div className="relative h-10">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-zinc-400 [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 shadow-sm transition",
            "placeholder:text-zinc-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15",
            "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
            Boolean(leftIcon) && "pl-10",
            Boolean(rightAddon) && "pr-16",
            error && "border-rose-400 focus:border-rose-600 focus:ring-rose-600/15",
            className,
          )}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
            {rightAddon}
          </span>
        )}
      </div>
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
