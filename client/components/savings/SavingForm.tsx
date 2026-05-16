"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { SavingMode } from "@/types";

type SavingFormProps = {
  onSuccess?: () => void;
};

export function SavingForm({ onSuccess }: SavingFormProps) {
  const {
    state: { accounts },
    actions,
  } = useFinance();
  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState("0");
  const [mode, setMode] = useState<SavingMode>("static");
  const [annualPercentage, setAnnualPercentage] = useState("0");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const parsedInitialAmount = Number(initialAmount) || 0;
    const needsAccount = parsedInitialAmount > 0;

    if (needsAccount && !accountId) {
      toast.error("Selecciona una cuenta para registrar el aporte inicial.");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await actions.addSaving({
        name: trimmedName,
        initialAmount: parsedInitialAmount,
        mode,
        annualPercentage: mode === "annualPercentage" ? Number(annualPercentage) || 0 : undefined,
        accountId: needsAccount ? accountId : undefined,
      });
      toast.success("Ahorro creado");

      setName("");
      setInitialAmount("0");
      setMode("static");
      setAnnualPercentage("0");
      setAccountId(accounts[0]?.id ?? "");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el ahorro.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Nombre</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Fondo de emergencia"
          aria-label="Nombre del ahorro"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Importe inicial</span>
        <Input
          type="number"
          step="0.01"
          value={initialAmount}
          onChange={(event) => setInitialAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe inicial"
        />
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Cuenta origen</span>
        <Select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">Selecciona una cuenta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-[color:var(--foreground)]/50">Se usará solo si el importe inicial es mayor que cero.</p>
      </label>
      <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
        <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Modo</span>
        <Select value={mode} onChange={(event) => setMode(event.target.value as SavingMode)}>
          <option value="static">Fijo</option>
          <option value="annualPercentage">Porcentaje anual</option>
        </Select>
      </label>
      {mode === "annualPercentage" ? (
        <label className="block space-y-1 text-sm text-[color:var(--foreground)]/75">
          <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--foreground)]/55">Porcentaje anual</span>
          <Input
            type="number"
            step="0.01"
            value={annualPercentage}
            onChange={(event) => setAnnualPercentage(event.target.value)}
            placeholder="0.00"
            aria-label="Porcentaje anual"
          />
        </label>
      ) : null}
      <Button type="submit" className="w-full" disabled={(accounts.length === 0 && Number(initialAmount) > 0) || isSubmitting}>
        {isSubmitting ? "Añadiendo ahorro..." : "Añadir ahorro"}
      </Button>
    </form>
  );
}
