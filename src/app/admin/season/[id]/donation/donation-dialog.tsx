"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContact, type Contact } from "@/actions/contact";
import {
  createDonation,
  updateDonation,
  type DonationInput,
  type DonationWithContact,
} from "@/actions/donation";
import { toast } from "sonner";

const formSchema = z
  .object({
    contactMode: z.enum(["existing", "new"]),
    contactId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    amount: z.coerce.number().positive("Le montant doit être supérieur à 0"),
    paymentType: z.enum(["cash", "check", "bank_transfer", "card", "other"]),
    date: z.string().min(1, "La date est requise"),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.contactMode === "existing" && !values.contactId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choisissez un contact",
        path: ["contactId"],
      });
    }
    if (values.contactMode === "new") {
      if (!values.firstName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Prénom requis",
          path: ["firstName"],
        });
      }
      if (!values.lastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nom requis",
          path: ["lastName"],
        });
      }
    }
  });

export type DonationFormValues = z.infer<typeof formSchema>;

type DonationDialogProps = {
  seasonId: number;
  contacts: Contact[];
  donation?: DonationWithContact;
  onSuccess?: () => void;
  onContactCreated?: (contact: Contact) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export function DonationDialog({
  seasonId,
  contacts,
  donation,
  onSuccess,
  onContactCreated,
}: DonationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactMode: "existing",
      contactId: donation ? String(donation.donatorId) : "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      amount: donation?.amount ?? 0,
      paymentType: donation?.paymentType ?? "cash",
      date: donation?.date ?? today(),
      notes: donation?.notes ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      contactMode: donation ? "existing" : "existing",
      contactId: donation ? String(donation.donatorId) : "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      amount: donation?.amount ?? 0,
      paymentType: donation?.paymentType ?? "cash",
      date: donation?.date ?? today(),
      notes: donation?.notes ?? "",
    });
  }, [donation, form, open]);

  const handleSubmit = async (values: DonationFormValues) => {
    try {
      setLoading(true);

      let contactId: number;
      if (values.contactMode === "existing") {
        contactId = Number(values.contactId);
      } else {
        const newContact = await createContact({
          firstName: values.firstName ?? "",
          lastName: values.lastName ?? "",
          phone: values.phone || null,
          email: values.email || null,
          address: values.address || null,
        });
        contactId = newContact.id;
        onContactCreated?.(newContact);
      }

      const payload: DonationInput = {
        seasonId,
        contactId,
        amount: values.amount,
        paymentType: values.paymentType,
        date: values.date,
        notes: values.notes || null,
      };

      if (donation) {
        await updateDonation(donation.id, payload);
        toast("Don mis à jour", { description: "Le don a été mis à jour." });
      } else {
        await createDonation(payload);
        toast("Don créé", { description: "Un nouveau don a été enregistré." });
      }

      setOpen(false);
      form.reset({
        contactMode: "existing",
        contactId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        amount: 0,
        paymentType: "cash",
        date: today(),
        notes: "",
      });
      onSuccess?.();
    } catch (error) {
      toast.error("Erreur", {
        description: donation ? "Échec de la mise à jour du don" : "Échec de la création du don",
      });
    } finally {
      setLoading(false);
    }
  };

  const contactMode = form.watch("contactMode");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {donation ? (
          <Button variant="outline" size="sm">
            Modifier
          </Button>
        ) : (
          <Button>Ajouter un don</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{donation ? "Modifier le don" : "Ajouter un don"}</DialogTitle>
          <DialogDescription>
            {donation ? "Mettez à jour les détails du don" : "Enregistrer un nouveau don"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={contactMode === "existing" ? "secondary" : "outline"}
                size="sm"
                onClick={() => form.setValue("contactMode", "existing")}
              >
                Contact existant
              </Button>
              <Button
                type="button"
                variant={contactMode === "new" ? "secondary" : "outline"}
                size="sm"
                onClick={() => form.setValue("contactMode", "new")}
              >
                Nouveau contact
              </Button>
            </div>

            {contactMode === "existing" ? (
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisissez un contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.firstName} {c.lastName} {c.email ? `- ${c.email}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 6 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="123 rue de la Paix, 75000 Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                        <SelectItem value="bank_transfer">Virement</SelectItem>
                        <SelectItem value="card">Carte</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Information complémentaire" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : donation ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
