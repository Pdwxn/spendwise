"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { Category } from "@/types";
import { INCOME_CATEGORY_ID, isSystemCategoryId } from "@/utils/constants";
import { formatCurrency } from "@/utils/formatters";
import { getAccountBalance } from "@/utils/calculations";

type TransactionMode = "income" | "expense";

type TransactionFormProps = {
  mode: TransactionMode;
  onSuccess?: () => void;
};

function getIncomeCategoryId(categories: Category[]) {
  return categories.find((category) => category.id === INCOME_CATEGORY_ID)?.id ?? "";
}

export function TransactionForm({ mode, onSuccess }: TransactionFormProps) {
  const {
    state: { accounts, categories, transactions },
    actions,
  } = useFinance();
  const [amount, setAmount] = useState("0");
  const expenseCategories = categories.filter((category) => !isSystemCategoryId(category.id));
  const [categoryId, setCategoryId] = useState(mode === "income" ? getIncomeCategoryId(categories) : expenseCategories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const formDisabled = accounts.length === 0 || (mode === "expense" && expenseCategories.length === 0) || (mode === "income" && !getIncomeCategoryId(categories));
  const selectedAccount = accounts.find((account) => account.id === accountId) ?? null;
  const selectedAccountBalance = selectedAccount ? getAccountBalance(selectedAccount, transactions) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accountId || !categoryId) {
      toast.error(mode === "expense" ? "Selecciona una cuenta y una categoría." : "Selecciona una cuenta.");
      return;
    }

    const trimmedDescription = description.trim();
    const parsedAmount = Number(amount);
    if (!trimmedDescription || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Revisa el importe y la descripción.");
      return;
    }

    if (mode === "expense" && selectedAccountBalance !== null && parsedAmount > selectedAccountBalance) {
      toast.error("El importe supera el saldo disponible de esta cuenta.");
      return;
    }

    try {
      await actions.addTransaction({
        type: mode,
        amount: parsedAmount,
        categoryId,
        description: trimmedDescription,
        date,
        accountId,
      });
      toast.success(mode === "expense" ? "Gasto creado" : "Ingreso creado");

      setAmount("0");
      setCategoryId(mode === "income" ? getIncomeCategoryId(categories) : expenseCategories[0]?.id ?? "");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setAccountId(accounts[0]?.id ?? "");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el movimiento.");
    }
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
        {mode === "expense" && selectedAccount ? (
          <p className="text-xs text-cyan-100/60">
            Saldo disponible: {formatCurrency(selectedAccountBalance ?? 0)}
          </p>
        ) : null}
      </label>
      {mode === "expense" ? (
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Categoría</span>
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Selecciona una categoría</option>
            {expenseCategories.map((category) => (
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
          Necesitas al menos una cuenta {mode === "expense" ? "y una categoría visible" : "y la categoría interna de ingresos"} para registrar movimientos.
        </p>
      ) : null}
    </form>
  );
}
