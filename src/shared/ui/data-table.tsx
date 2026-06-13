import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@shared/lib/cn";

/** Props для таблицы на базе TanStack Table с сортировкой колонок. */
export interface DataTableProps<TData, TValue = unknown> {
  /** Описание колонок TanStack Table. */
  columns: Array<ColumnDef<TData, TValue>>;
  /** Массив строк, которые нужно отрисовать в таблице. */
  data: TData[];
  /** Текст для пустого состояния. По умолчанию "Нет данных". */
  emptyText?: string;
}

function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") {
    return <ArrowUp className="size-3.5" />;
  }

  if (state === "desc") {
    return <ArrowDown className="size-3.5" />;
  }

  return <ChevronsUpDown className="size-3.5 opacity-55" />;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  emptyText = "Нет данных",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase tracking-[0.04em] text-zinc-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3 font-semibold"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-2 rounded-md text-left transition-colors",
                            "hover:text-zinc-900  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIcon state={sorted} />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-zinc-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-zinc-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-zinc-500"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
