import type { Category } from "@/types";

export const STORAGE_KEY = "spendwise:finance-state";

export const DEFAULT_LOCALE = "es-ES";
export const DEFAULT_CURRENCY = "USD";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "category-food",
    name: "Comida",
    emoji: "🍽️",
    color: "#f97316",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-transport",
    name: "Transporte",
    emoji: "🚗",
    color: "#3b82f6",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-home",
    name: "Hogar",
    emoji: "🏠",
    color: "#8b5cf6",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-health",
    name: "Salud",
    emoji: "💊",
    color: "#ec4899",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
  {
    id: "category-income",
    name: "Ingresos",
    emoji: "💰",
    color: "#22c55e",
    createdAt: "2026-04-30T00:00:00.000Z",
  },
];
