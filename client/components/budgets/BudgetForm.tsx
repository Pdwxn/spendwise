"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { MonthKey } from "@/types";

export function BudgetForm() {
  const {
    state: { categories, selectedMonth },
    actions,
  } = useFinance();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [month, setMonth] = useState(selectedMonth);
  const [amount, setAmount] = useState("0");

  useEffect(() => {
    if (categories.length === 0) {
      setCategoryId("");
      return;
    }

    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categoryId, categories]);

  useEffect(() => {
    if (!month) {
      setMonth(selectedMonth);
    }
  }, [month, selectedMonth]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId || !month) {
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    actions.addBudget({
      categoryId,
      month,
      amount: parsedAmount,
    });

    setCategoryId(categories[0]?.id ?? "");
    setMonth(selectedMonth);
    setAmount("0");
  }

  return (
    <Card id="budget-form" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Nuevo presupuesto</h2>
        <p className="text-sm text-cyan-100/65">Asigna un importe mensual a una categoría.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Categoría</span>
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Mes</span>
          <Input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value as MonthKey)}
            aria-label="Mes del presupuesto"
          />
        </label>
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Importe</span>
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
        <Button type="submit" className="w-full" disabled={categories.length === 0}>
          Añadir presupuesto
        </Button>
        {categories.length === 0 ? (
          <p className="text-xs text-cyan-100/60">Primero crea una categoría para poder asignarle un presupuesto.</p>
        ) : null}
      </form>
    </Card>
  );
}
