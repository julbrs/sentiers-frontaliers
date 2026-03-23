"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { deletePendingMembership } from "@/actions/membership";

export function ProfileAlert({
  type,
  checkoutSessionId,
  errorCode,
}: {
  type: "success" | "failed";
  checkoutSessionId?: string;
  errorCode?: string;
}) {
  useEffect(() => {
    if (type === "success") {
      toast("✓ Paiement confirmé", {
        description: "Merci pour votre adhésion! Vous recevrez un email de confirmation.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/profile");
    } else if (type === "failed") {
      toast.error("✗ Paiement échoué", {
        description: errorCode
          ? `Code d'erreur: ${errorCode}. Veuillez réessayer.`
          : "Votre paiement n'a pas pu être traité. Veuillez réessayer.",
      });

      // Delete pending membership if checkout session ID is available
      if (checkoutSessionId) {
        deletePendingMembership(checkoutSessionId).catch((error) => {
          console.error("Failed to delete pending membership:", error);
        });
      }

      // Clean up URL
      window.history.replaceState({}, "", "/profile");
    }
  }, [type, checkoutSessionId, errorCode]);

  return null;
}
