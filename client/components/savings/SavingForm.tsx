"use client";

import type { FormEvent } from "react";
import { useState } from "react";
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
  const { actions } = useFinance();
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState("0");
  const [mode, setMode] = useState<SavingMode>("static");
  const [annualPercentage, setAnnualPercentage] = useState("0");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    try {
      await actions.addSaving({
        name: trimmedName,
        initialAmount: Number(initialAmount) || 0,
        mode,
        annualPercentage: mode === "annualPercentage" ? Number(annualPercentage) || 0 : undefined,
      });
      toast.success("Ahorro creado");

      setName("");
      setInitialAmount("0");
      setMode("static");
      setAnnualPercentage("0");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el ahorro.");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Nombre</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Fondo de emergencia"
          aria-label="Nombre del ahorro"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Importe inicial</span>
        <Input
          type="number"
          step="0.01"
          value={initialAmount}
          onChange={(event) => setInitialAmount(event.target.value)}
          placeholder="0.00"
          aria-label="Importe inicial"
        />
      </label>
      <label className="block space-y-1 text-sm text-cyan-100/70">
        <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Modo</span>
        <Select value={mode} onChange={(event) => setMode(event.target.value as SavingMode)}>
          <option value="static">Fijo</option>
          <option value="annualPercentage">Porcentaje anual</option>
        </Select>
      </label>
      {mode === "annualPercentage" ? (
        <label className="block space-y-1 text-sm text-cyan-100/70">
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">Porcentaje anual</span>
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
      <Button type="submit" className="w-full">
        Añadir ahorro
      </Button>
    </form>
  );
}
