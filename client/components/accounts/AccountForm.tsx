"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useFinance } from "@/hooks/useFinance";
import type { HexColor } from "@/types";

const defaultColor = "#0f172a";

export function AccountForm() {
  const { actions } = useFinance();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [color, setColor] = useState<HexColor>(defaultColor);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    actions.addAccount({
      name: trimmedName,
      initialBalance: Number(initialBalance) || 0,
      color,
    });

    setName("");
    setInitialBalance("0");
    setColor(defaultColor);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">New account</h2>
        <p className="text-sm text-slate-500">Define a name, initial balance, and color.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Account name"
          aria-label="Account name"
        />
        <Input
          type="number"
          step="0.01"
          value={initialBalance}
          onChange={(event) => setInitialBalance(event.target.value)}
          placeholder="Initial balance"
          aria-label="Initial balance"
        />
        <Input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value as HexColor)}
          aria-label="Account color"
          className="h-12 p-1"
        />
        <Button type="submit" className="w-full">
          Add account
        </Button>
      </form>
    </Card>
  );
}
