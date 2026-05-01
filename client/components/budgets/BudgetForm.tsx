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
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">New budget</h2>
        <p className="text-sm text-slate-500">Assign a monthly amount to a category.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </Select>
        <Input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value as MonthKey)}
          aria-label="Budget month"
        />
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          aria-label="Budget amount"
        />
        <Button type="submit" className="w-full" disabled={categories.length === 0}>
          Add budget
        </Button>
      </form>
    </Card>
  );
}
