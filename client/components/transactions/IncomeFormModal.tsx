"use client";

import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Modal } from "@/components/ui/Modal";

type IncomeFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function IncomeFormModal({ open, onClose }: IncomeFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo ingreso" description="Registra un ingreso con cuenta, importe y fecha.">
      <TransactionForm mode="income" onSuccess={onClose} />
    </Modal>
  );
}
