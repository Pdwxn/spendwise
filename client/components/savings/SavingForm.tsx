"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFinance } from "@/hooks/useFinance";
import type { SavingMode } from "@/types";

export function SavingForm() {
  const { actions } = useFinance();
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState("0");
  const [mode, setMode] = useState<SavingMode>("static");
  const [annualPercentage, setAnnualPercentage] = useState("0");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    actions.addSaving({
      name: trimmedName,
      initialAmount: Number(initialAmount) || 0,
      mode,
      annualPercentage: mode === "annualPercentage" ? Number(annualPercentage) || 0 : undefined,
    });

    setName("");
    setInitialAmount("0");
    setMode("static");
    setAnnualPercentage("0");
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">New saving</h2>
        <p className="text-sm text-slate-500">Create a static saving or an annual projection.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Saving name"
          aria-label="Saving name"
        />
        <Input
          type="number"
          step="0.01"
          value={initialAmount}
          onChange={(event) => setInitialAmount(event.target.value)}
          placeholder="Initial amount"
          aria-label="Initial amount"
        />
        <Select value={mode} onChange={(event) => setMode(event.target.value as SavingMode)}>
          <option value="static">Static</option>
          <option value="annualPercentage">Annual percentage</option>
        </Select>
        {mode === "annualPercentage" ? (
          <Input
            type="number"
            step="0.01"
            value={annualPercentage}
            onChange={(event) => setAnnualPercentage(event.target.value)}
            placeholder="Annual percentage"
            aria-label="Annual percentage"
          />
        ) : null}
        <Button type="submit" className="w-full">
          Add saving
        </Button>
      </form>
    </Card>
  );
}
