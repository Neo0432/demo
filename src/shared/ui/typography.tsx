import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

/** Props для верхнего заголовка страницы. */
export interface PageTitleProps {
  /** Описание или подзаголовок под главным заголовком. */
  children?: ReactNode;
  /** Главный заголовок страницы. */
  title: string;
  /** Небольшой текст над заголовком, например категория или раздел. */
  eyebrow?: string;
  /** Правая область для действий, например кнопок. */
  action?: ReactNode;
}

export function PageTitle({
  action,
  children,
  eyebrow,
  title,
}: PageTitleProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="grid max-w-3xl gap-3">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-teal-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold tracking-normal text-zinc-950 md:text-5xl">
          {title}
        </h1>
        {children && (
          <p className="text-base leading-7 text-zinc-600">{children}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 gap-3">{action}</div>}
    </div>
  );
}

/** Props для заголовка секции. */
export interface SectionHeadingProps {
  /** Описание секции под заголовком. */
  children?: ReactNode;
  /** Заголовок секции. */
  title: string;
  /** Правая область для дополнительных действий секции. */
  action?: ReactNode;
}

export function SectionHeading({
  action,
  children,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        {children && (
          <p className="text-sm leading-6 text-zinc-600">{children}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

/** Props для базового текстового абзаца. */
export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Текст или JSX-содержимое абзаца. */
  children?: ReactNode;
}

export function Text({ children, className, ...props }: TextProps) {
  return (
    <p className={cn("text-sm leading-6 text-zinc-600", className)} {...props}>
      {children}
    </p>
  );
}
