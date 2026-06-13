import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

/** Цветовой тон бейджа. */
export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

/** Props для компактного статусного бейджа. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Текст или другой короткий контент внутри бейджа. */
  children?: ReactNode;
  /** Цветовой тон бейджа. По умолчанию `neutral`. */
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-zinc-200 bg-zinc-100 text-zinc-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
