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
import { createContact, updateContact, type ContactInput, type Contact } from "@/actions/contact";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof formSchema>;

type ContactDialogProps = {
  contact?: Contact;
  onSuccess?: () => void;
};

export function ContactDialog({ contact, onSuccess }: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      address: contact?.address ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      address: contact?.address ?? "",
    });
  }, [contact, form, open]);

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      setLoading(true);

      const input: ContactInput = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
      };

      if (contact) {
        await updateContact(contact.id, input);
        toast("Contact mis à jour", {
          description: "Le contact a été mis à jour avec succès.",
        });
      } else {
        await createContact(input);
        toast("Contact créé", { description: "Un nouveau contact a été créé." });
      }

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Erreur", {
        description: contact
          ? "Échec de la mise à jour du contact"
          : "Échec de la création du contact",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {contact ? (
          <Button variant="outline" size="sm">
            Modifier
          </Button>
        ) : (
          <Button>Ajouter un contact</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Modifier le contact" : "Ajouter un contact"}</DialogTitle>
          <DialogDescription>
            {contact ? "Mettre à jour les détails du contact" : "Créer un nouveau contact"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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
              name="phone"
              render={({ field }) => (
                <FormItem>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jean.dupont@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="123 rue de la Paix, 75000 Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {loading ? "Enregistrement..." : contact ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
