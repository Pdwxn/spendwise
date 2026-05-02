"use client";

import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFinance } from "@/hooks/useFinance";
import { filterTransactions } from "@/utils/calculations";

export default function TransactionsPage() {
  const {
    state: { categories, selectedCategoryId, selectedMonth, transactions },
  } = useFinance();

  const filteredTransactions = filterTransactions(transactions, {
    month: selectedMonth,
    categoryId: selectedCategoryId,
  }).sort((left, right) => right.date.localeCompare(left.date));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        description="Filtra y revisa ingresos y gastos."
      />

      <TransactionFilters categories={categories} />

      <section>
        <TransactionList transactions={filteredTransactions} />
      </section>
    </div>
  );
}
