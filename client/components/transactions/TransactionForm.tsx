"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";

export function TransactionForm() {
  const {
    state: { accounts, categories },
    actions,
  } = useFinance();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("0");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const formDisabled = accounts.length === 0 || categories.length === 0;

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
    if (categories.length === 0) {
      setCategoryId("");
      return;
    }

    if (!categories.some((category) => category.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categoryId, categories]);

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
      type,
      amount: parsedAmount,
      categoryId,
      description: trimmedDescription,
      date,
      accountId,
    });

    setType("expense");
    setAmount("0");
    setCategoryId(categories[0]?.id ?? "");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setAccountId(accounts[0]?.id ?? "");
  }

  return (
    <Card id="transaction-form" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cyan-50">Nuevo movimiento</h2>
        <p className="text-sm text-cyan-100/65">Registra un ingreso o un gasto.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Tipo</span>
          <Select value={type} onChange={(event) => setType(event.target.value as "income" | "expense")}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </Select>
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
        <Button
          type="submit"
          className="w-full"
          disabled={formDisabled}
        >
          Añadir movimiento
        </Button>
        {formDisabled ? (
          <p className="text-xs text-cyan-100/60">
            Necesitas al menos una cuenta y una categoría para registrar movimientos.
          </p>
        ) : null}
      </form>
    </Card>
  );
}
