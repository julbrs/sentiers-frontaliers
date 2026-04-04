"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number) => void;
  currentAmount: number;
}

export function DonationDialog({
  open,
  onOpenChange,
  onConfirm,
  currentAmount,
}: DonationDialogProps) {
  const [amount, setAmount] = useState(currentAmount.toString());

  useEffect(() => {
    if (open) {
      setAmount(currentAmount.toString());
    }
  }, [open, currentAmount]);

  const handleConfirm = () => {
    const parsedAmount = parseInt(amount, 10) || 0;
    if (parsedAmount >= 0) {
      onConfirm(parsedAmount);
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    onConfirm(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Ajouter un don</DialogTitle>
          <DialogDescription>Montant en dollars entiers uniquement</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormItem>
            <FormLabel>Montant du don ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="Montant en $"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {parseInt(amount, 10) > 20 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">📄 Reçu fiscal</p>
              <p>Un reçu fiscal sera généré pour votre don de ${amount}.</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentAmount > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700"
            >
              Annuler le don
            </Button>
          )}
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-(--sf-red-700) hover:bg-(--sf-red-800)"
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
