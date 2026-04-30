"use client";

import { useContext } from "react";
import { FinanceContext } from "@/context/FinanceContext";

export function useFinance() {
  const context = useContext(FinanceContext);

  if (context === null) {
    throw new Error("useFinance must be used within FinanceProvider.");
  }

  return context;
}
