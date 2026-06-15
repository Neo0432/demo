import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

/** Props для поля пароля с переключателем видимости. */
export interface PasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> {
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
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { className, error, hint, id, label, leftIcon, ...props },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const [isVisible, setIsVisible] = useState(false);

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
            ref={ref}
            id={inputId}
            type={isVisible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 pr-11 text-sm text-zinc-950 shadow-sm transition",
              "placeholder:text-zinc-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/15",
              "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
              Boolean(leftIcon) && "pl-10",
              error &&
                "border-rose-400 focus:border-rose-600 focus:ring-rose-600/15",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            aria-label={isVisible ? "Скрыть пароль" : "Показать пароль"}
            aria-pressed={isVisible}
            className={cn(
              "absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors cursor-pointer",
              "hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
              props.disabled && "pointer-events-none opacity-50",
            )}
            disabled={props.disabled}
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
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
  },
);
