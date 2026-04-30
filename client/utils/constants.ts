import type { Category } from "@/types";

export const STORAGE_KEY = "spendwise:finance-state";

export const DEFAULT_LOCALE = "es-ES";
export const DEFAULT_CURRENCY = "USD";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "category-food",
    name: "Food",
    emoji: "🍽️",
    color: "#f97316",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-transport",
    name: "Transport",
    emoji: "🚗",
    color: "#3b82f6",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-home",
    name: "Home",
    emoji: "🏠",
    color: "#8b5cf6",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-health",
    name: "Health",
    emoji: "💊",
    color: "#ec4899",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-income",
    name: "Income",
    emoji: "💰",
    color: "#22c55e",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
];
