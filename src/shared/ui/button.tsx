import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

/** Визуальный стиль кнопки. */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

/** Размер кнопки. */
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/** Props для базовой кнопки UI-kit. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Содержимое кнопки: текст, иконка или их комбинация. */
  children?: ReactNode;
  /** Визуальный стиль кнопки. По умолчанию `primary`. */
  variant?: ButtonVariant;
  /** Размер кнопки. По умолчанию `md`. */
  size?: ButtonSize;
  /** Показывает спиннер и блокирует кнопку. */
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus-visible:outline-teal-700",
  secondary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 focus-visible:outline-zinc-900",
  outline:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 focus-visible:outline-teal-700",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 focus-visible:outline-teal-700",
  danger:
    "bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:outline-rose-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      isLoading,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "hover: cursor-pointer",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <LoaderCircle className="size-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
