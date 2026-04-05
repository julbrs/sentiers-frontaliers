"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDonationCheckout } from "@/actions/donation";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
  address: z.string().trim().min(1, "L'adresse est requise"),
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0"),
});

type DonationCheckoutFormValues = z.infer<typeof formSchema>;

type DonationCheckoutFormProps = {
  initialFirstName?: string;
  initialLastName?: string;
  initialAddress?: string;
};

export function DonationCheckoutForm({
  initialFirstName = "",
  initialLastName = "",
  initialAddress = "",
}: DonationCheckoutFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<DonationCheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      address: initialAddress,
      amount: 20,
    },
  });

  const onSubmit = async (values: DonationCheckoutFormValues) => {
    try {
      setLoading(true);
      const checkoutUrl = await createDonationCheckout(values);
      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de créer la session de paiement Clover.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Alexandre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Tremblay" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="1234, rue Saint-Denis, Montréal, QC H2X 3J4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant du don ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-medium">Paiement sécurisé</p>
          <p>Vous serez redirigé vers Clover pour finaliser votre paiement.</p>
          <p>Un reçu fiscal vous sera envoyé par courriel pour les dons de 20$ et plus.</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white"
        >
          {loading ? "Création de la session Clover..." : "Passer au paiement Clover"}
        </Button>
      </form>
    </Form>
  );
}
