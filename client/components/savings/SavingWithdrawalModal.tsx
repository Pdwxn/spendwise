"use client";

import { Modal } from "@/components/ui/Modal";
import { SavingWithdrawalForm } from "@/components/savings/SavingWithdrawalForm";
import type { ID } from "@/types";

type SavingWithdrawalModalProps = {
  open: boolean;
  savingId: ID | null;
  onClose: () => void;
};

export function SavingWithdrawalModal({ open, savingId, onClose }: SavingWithdrawalModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Retirar ahorro" description="Devuelve dinero del ahorro a una cuenta.">
      {savingId ? <SavingWithdrawalForm savingId={savingId} onSuccess={onClose} /> : null}
    </Modal>
  );
}
