"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { ID } from "@/types";

type SavingContributionFormProps = {
  savingId: ID;
  onSuccess?: () => void;
};

export function SavingContributionForm({ savingId, onSuccess }: SavingContributionFormProps) {
  const {
    state: { accounts, savings },
    actions,
  } = useFinance();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const saving = savings.find((item) => item.id === savingId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    const trimmedDescription = description.trim();

    if (!accountId || !saving || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Revisa la cuenta y el importe.");
      return;
    }

    actions.addSavingContribution({
      savingId,
      accountId,
      amount: parsedAmount,
      description: trimmedDescription || `Abono a ${saving.name}`,
      date,
    });

    toast.success("Abono registrado");
    setAccountId(accounts[0]?.id ?? "");
    setAmount("0");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    onSuccess?.();
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Cuenta origen</span>
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
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe del abono"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Descripción</span>
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Opcional"
          aria-label="Descripción del abono"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Fecha</span>
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Fecha del abono"
        />
      </label>
      <Button type="submit" className="w-full" disabled={accounts.length === 0 || !saving}>
        Abonar
      </Button>
    </form>
  );
}
