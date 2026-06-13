import { useId } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

/** Props для переключателя с подписью и управляемым состоянием. */
export interface SwitchFieldProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  /** Текущее состояние переключателя. */
  checked: boolean;
  /** Подпись переключателя. */
  label: string;
  /** Дополнительная подсказка под подписью. */
  hint?: string;
  /** Вызывается при клике с новым значением `checked`. */
  onCheckedChange: (checked: boolean) => void;
}

export function SwitchField({
  checked,
  className,
  hint,
  label,
  onCheckedChange,
  ...props
}: SwitchFieldProps) {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-1">
        <label htmlFor={id} className="text-sm font-medium text-zinc-900">
          {label}
        </label>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
          "hover: cursor-pointer",
          checked ? "bg-teal-700" : "bg-zinc-300",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
