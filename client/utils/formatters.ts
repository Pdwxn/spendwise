import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/utils/constants";
import type { MonthKey } from "@/types";

type FormatCurrencyOptions = {
  locale?: string;
  currency?: string;
};

export function formatCurrency(
  value: number,
  { locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY }: FormatCurrencyOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(0)}%`;
}

export function formatShortDate(value: string, locale: string = DEFAULT_LOCALE) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMonthLabel(month: MonthKey, locale: string = DEFAULT_LOCALE) {
  const [year, monthPart] = month.split("-");
  const date = new Date(Number(year), Number(monthPart) - 1, 1);

  if (Number.isNaN(date.getTime())) {
    return month;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}
