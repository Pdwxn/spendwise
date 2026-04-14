'use client';

import { useContext } from 'react';
import { FinanceContext } from '@/context/FinanceContext';

export function useFinance() {
  const ctx = useContext(FinanceContext);

  if (!ctx) {
    throw new Error(
      '[useFinance] Hook used outside of <FinanceProvider>. ' +
      'Make sure your app is wrapped with <FinanceProvider> in layout.tsx.'
    );
  }

  return ctx;
}