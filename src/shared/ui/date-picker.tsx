import { DayPicker } from "react-day-picker";

/** Props для одиночного выбора даты на базе react-day-picker. */
export interface DatePickerProps {
  /** Текущая выбранная дата. */
  selected?: Date;
  /** Вызывается при выборе даты или сбросе выбора. */
  onSelect: (date: Date | undefined) => void;
}

const formatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function DatePicker({ onSelect, selected }: DatePickerProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        weekStartsOn={1}
        showOutsideDays
        footer={
          selected ? (
            <span>Выбрано: {formatter.format(selected)}</span>
          ) : (
            <span>Дата не выбрана</span>
          )
        }
      />
    </div>
  );
}
