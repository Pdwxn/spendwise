"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { Category } from "@/types";

type TransactionMode = "income" | "expense";

type TransactionFormProps = {
  mode: TransactionMode;
  onSuccess?: () => void;
};

function getIncomeCategoryId(categories: Category[]) {
  return categories.find((category) => category.id === "category-income")?.id ?? categories[0]?.id ?? "";
}

export function TransactionForm({ mode, onSuccess }: TransactionFormProps) {
  const {
    state: { accounts, categories },
    actions,
  } = useFinance();
  const [amount, setAmount] = useState("0");
  const [categoryId, setCategoryId] = useState(mode === "income" ? getIncomeCategoryId(categories) : categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const formDisabled = accounts.length === 0 || (mode === "expense" && categories.length === 0);

  useEffect(() => {
    if (accounts.length === 0) {
      setAccountId("");
      return;
    }

    if (!accounts.some((account) => account.id === accountId)) {
      setAccountId(accounts[0].id);
    }
  }, [accountId, accounts]);

  useEffect(() => {
    if (mode === "income") {
      setCategoryId(getIncomeCategoryId(categories));
      return;
    }

    if (categories.length === 0) {
      setCategoryId("");
      return;
    }

    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categoryId, categories, mode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accountId || !categoryId) {
      return;
    }

    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);
    if (!trimmedDescription || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    actions.addTransaction({
      type: mode,
      amount: parsedAmount,
      categoryId,
      description: trimmedDescription,
      date,
      accountId,
    });

    setAmount("0");
    setCategoryId(mode === "income" ? getIncomeCategoryId(categories) : categories[0]?.id ?? "");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setAccountId(accounts[0]?.id ?? "");
    onSuccess?.();
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Importe</span>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Cuenta</span>
        <Select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">Selecciona una cuenta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </label>
      {mode === "expense" ? (
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
      ) : null}
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Descripción</span>
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ej. Supermercado"
          aria-label="Descripción"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Fecha</span>
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Fecha del movimiento"
        />
      </label>
      <Button type="submit" className="w-full" disabled={formDisabled}>
        Añadir {mode === "expense" ? "gasto" : "ingreso"}
      </Button>
      {formDisabled ? (
        <p className="text-xs text-cyan-100/60">
          Necesitas al menos una cuenta {mode === "expense" ? "y una categoría" : ""} para registrar movimientos.
        </p>
      ) : null}
    </form>
  );
}
