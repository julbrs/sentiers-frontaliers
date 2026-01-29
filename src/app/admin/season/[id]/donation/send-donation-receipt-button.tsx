"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

type SendDonationReceiptButtonProps = {
  donationId: number;
  contactEmail?: string | null;
  onSuccess?: () => void;
};

export function SendDonationReceiptButton({
  donationId,
  contactEmail,
  onSuccess,
}: SendDonationReceiptButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/donation/${donationId}/send-donation-receipt`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Échec de l'envoi du reçu");
      }

      toast({ title: "Reçu envoyé", description: "Le reçu de don a été envoyé." });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer le reçu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading || !contactEmail}
      title={contactEmail ? "Envoyer le reçu de don" : "Aucune adresse email disponible"}
      onClick={handleSend}
    >
      <Mail className="h-4 w-4 mr-2" />
      Reçu
    </Button>
  );
}
