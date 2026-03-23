"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ProfileAlert({ type }: { type: "success" | "failed" }) {
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (type === "success") {
        toast.success("✓ Paiement confirmé", {
          description:
            "Merci pour votre adhésion! Vous recevrez un email de confirmation avec les cartes de membre.",
        });
      } else if (type === "failed") {
        toast.error("✗ Paiement échoué", {
          description: "Votre paiement n'a pas pu être traité. Veuillez réessayer.",
        });
      }
      window.history.replaceState({}, "", "/profile");
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [type]);

  return null;
}
