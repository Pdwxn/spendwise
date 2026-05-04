"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { ID } from "@/types";

type SavingWithdrawalFormProps = {
  savingId: ID;
  onSuccess?: () => void;
};

export function SavingWithdrawalForm({ savingId, onSuccess }: SavingWithdrawalFormProps) {
  const {
    state: { accounts, savings, savingContributions, savingWithdrawals },
    actions,
  } = useFinance();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const saving = savings.find((item) => item.id === savingId);
  const availableAmount = saving
    ? saving.initialAmount
      + savingContributions.filter((item) => item.savingId === savingId).reduce((total, item) => total + item.amount, 0)
      - savingWithdrawals.filter((item) => item.savingId === savingId).reduce((total, item) => total + item.amount, 0)
    : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    const trimmedDescription = description.trim();

    if (!accountId || !saving || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > availableAmount) {
      toast.error("Revisa la cuenta y el importe disponible.");
      return;
    }

    try {
      await actions.addSavingWithdrawal({
        savingId,
        accountId,
        amount: parsedAmount,
        description: trimmedDescription || `Retiro de ${saving.name}`,
        date,
      });

      toast.success("Dinero agregado a cuenta");
      setAccountId(accounts[0]?.id ?? "");
      setAmount("0");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el retiro.");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Cuenta destino</span>
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
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Importe</span>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          max={availableAmount}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe del retiro"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Descripción</span>
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Opcional"
          aria-label="Descripción del retiro"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Fecha</span>
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Fecha del retiro"
        />
      </label>
      <Button type="submit" className="w-full" disabled={accounts.length === 0 || !saving || availableAmount <= 0}>
        Agregar a cuenta
      </Button>
    </form>
  );
}
