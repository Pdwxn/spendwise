"use client";

import { Modal } from "@/components/ui/Modal";
import { SavingContributionForm } from "@/components/savings/SavingContributionForm";
import type { ID } from "@/types";

type SavingContributionModalProps = {
  open: boolean;
  savingId: ID | null;
  onClose: () => void;
};

export function SavingContributionModal({ open, savingId, onClose }: SavingContributionModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Abonar ahorro" description="Traslada dinero desde una cuenta al ahorro.">
      {savingId ? <SavingContributionForm savingId={savingId} onSuccess={onClose} /> : null}
    </Modal>
  );
}
