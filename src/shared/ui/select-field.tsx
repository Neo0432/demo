import Select from "react-select";
import type { SingleValue, StylesConfig } from "react-select";
import { useId } from "react";

/** Опция для SelectField. */
export interface SelectOption {
  /** Значение, которое хранится в состоянии формы. */
  value: string;
  /** Текст, который видит пользователь в списке. */
  label: string;
}

/** Props для select-поля на базе react-select. */
export interface SelectFieldProps {
  /** Подпись поля, связанная с input внутри react-select. */
  label: string;
  /** Список доступных опций. */
  options: SelectOption[];
  /** Текущее выбранное значение. Пустая строка означает отсутствие выбора. */
  value: string;
  /** Placeholder внутри select. По умолчанию "Выберите значение". */
  placeholder?: string;
  /** Текст-подсказка под полем. Не показывается, если передан `error`. */
  hint?: string;
  /** Текст ошибки под полем. Также включает `aria-invalid`. */
  error?: string;
  /** Вызывается при выборе или очистке значения. */
  onChange: (value: string) => void;
}

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    borderColor: state.isFocused ? "#0f766e" : "#d4d4d8",
    boxShadow: state.isFocused ? "0 0 0 2px rgb(15 118 110 / 0.15)" : "none",
    ":hover": {
      borderColor: state.isFocused ? "#0f766e" : "#a1a1aa",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 30,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0f766e"
      : state.isFocused
        ? "#f4f4f5"
        : "white",
    color: state.isSelected ? "white" : "#18181b",
  }),
};

export function SelectField({
  error,
  hint,
  label,
  onChange,
  options,
  placeholder = "Выберите значение",
  value,
}: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const selectedOption = options.find((option) => option.value === value) ?? null;

  function handleChange(option: SingleValue<SelectOption>) {
    onChange(option?.value ?? "");
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-900">
        {label}
      </label>
      <Select<SelectOption, false>
        inputId={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        styles={selectStyles}
        isClearable
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
