import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function sanitizeNumericValue(value: string) {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const firstDotIndex = normalized.indexOf(".");

  if (firstDotIndex === -1) {
    return normalized;
  }

  return `${normalized.slice(0, firstDotIndex)}.${normalized.slice(firstDotIndex + 1).replace(/\./g, "")}`;
}

export function Input({ className, onChange, onKeyDown, type, inputMode, pattern, ...props }: InputProps) {
  const isNumberInput = type === "number";

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isNumberInput) {
      onKeyDown?.(event);
      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
      "Enter",
    ];

    if (
      event.ctrlKey ||
      event.metaKey ||
      allowedKeys.includes(event.key) ||
      /^[0-9.]$/.test(event.key)
    ) {
      onKeyDown?.(event);
      return;
    }

    event.preventDefault();
    onKeyDown?.(event);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (isNumberInput) {
      const sanitizedValue = sanitizeNumericValue(event.currentTarget.value);
      if (sanitizedValue !== event.currentTarget.value) {
        event.currentTarget.value = sanitizedValue;
      }
    }

    onChange?.(event);
  }

  return (
    <input
      className={`h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--foreground)]/40 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:bg-[color:var(--surface-strong)] sm:text-sm ${className ?? ""}`}
      inputMode={isNumberInput ? "decimal" : inputMode}
      pattern={isNumberInput ? "[0-9]*[.]?[0-9]*" : pattern}
      type={type}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
