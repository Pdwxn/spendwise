"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { MonthKey } from "@/types";
import { isSystemCategoryId } from "@/utils/constants";

type BudgetFormProps = {
  onSuccess?: () => void;
};

export function BudgetForm({ onSuccess }: BudgetFormProps) {
  const {
    state: { categories, selectedMonth },
    actions,
  } = useFinance();
  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visibleCategories = categories.filter((category) => !isSystemCategoryId(category.id));
  const [categoryId, setCategoryId] = useState(visibleCategories[0]?.id ?? "");
  const [month, setMonth] = useState(selectedMonth);
  const [amount, setAmount] = useState("0");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      return;
    }

    if (!categoryId || !month) {
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await actions.addBudget({
        categoryId,
        month,
        amount: parsedAmount,
      });
      toast.success("Presupuesto creado");

      setCategoryId(visibleCategories[0]?.id ?? "");
      setMonth(selectedMonth);
      setAmount("0");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el presupuesto.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Categoría</span>
        <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Selecciona una categoría</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Mes</span>
        <Input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value as MonthKey)}
          aria-label="Mes del presupuesto"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Importe</span>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe del presupuesto"
        />
      </label>
      <Button type="submit" className="w-full" disabled={visibleCategories.length === 0 || isSubmitting}>
        {isSubmitting ? "Añadiendo presupuesto..." : "Añadir presupuesto"}
      </Button>
      {visibleCategories.length === 0 ? (
        <p className="text-xs text-[color:var(--foreground)]/60">Primero crea una categoría para poder asignarle un presupuesto.</p>
      ) : null}
    </form>
  );
}
