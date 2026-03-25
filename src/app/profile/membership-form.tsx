"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { createMembershipCheckout } from "@/actions/membership";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const membershipFormSchema = z
  .object({
    type: z.enum(["personal", "family"]),
    firstName: z.string().trim().min(1, "Le prénom est requis"),
    lastName: z.string().trim().min(1, "Le nom est requis"),
    address: z.string().trim().min(1, "L'adresse est requise"),
    phone: z.string().trim().min(1, "Le téléphone est requis"),
    email: z.string().trim().email("Adresse email invalide"),
    donationEnabled: z.boolean().optional().default(false),
    donationAmount: z.number().int().optional().default(0),
    topoMapOrder: z.boolean().optional().default(false),
    secondAdultFirstName: z.string().trim().optional(),
    secondAdultLastName: z.string().trim().optional(),
    children: z.array(
      z.object({
        firstName: z.string().trim().min(1, "Prénom requis"),
        lastName: z.string().trim().min(1, "Nom requis"),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (values.type !== "family") {
      return;
    }

    if (!values.secondAdultFirstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prénom du 2e adulte est requis",
        path: ["secondAdultFirstName"],
      });
    }

    if (!values.secondAdultLastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom du 2e adulte est requis",
        path: ["secondAdultLastName"],
      });
    }

    if (!values.children.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ajoutez au moins un enfant",
        path: ["children"],
      });
    }
  });

type MembershipFormValues = z.infer<typeof membershipFormSchema>;

type MembershipFormProps = {
  initialFirstName?: string;
  initialLastName?: string;
  initialEmail?: string;
};

export function MembershipForm({
  initialFirstName = "",
  initialLastName = "",
  initialEmail = "",
}: MembershipFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      type: "personal",
      firstName: initialFirstName,
      lastName: initialLastName,
      address: "",
      phone: "",
      email: initialEmail,
      donationEnabled: false,
      donationAmount: 0,
      topoMapOrder: false,
      secondAdultFirstName: "",
      secondAdultLastName: "",
      children: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });

  const selectedType = form.watch("type");
  const isFamily = selectedType === "family";

  useEffect(() => {
    if (isFamily) {
      return;
    }

    form.setValue("secondAdultFirstName", "");
    form.setValue("secondAdultLastName", "");
    form.setValue("children", []);
  }, [form, isFamily]);

  useEffect(() => {
    form.setValue("firstName", initialFirstName);
    form.setValue("lastName", initialLastName);
    form.setValue("email", initialEmail);
  }, [form, initialEmail, initialFirstName, initialLastName]);

  const onSubmit = async (values: MembershipFormValues) => {
    try {
      setLoading(true);
      const checkoutUrl = await createMembershipCheckout({
        ...values,
        donationAmount: values.donationEnabled ? (values.donationAmount ?? 0) : 0,
        topoMapOrder: values.topoMapOrder ?? false,
        secondAdultFirstName: values.type === "family" ? values.secondAdultFirstName : undefined,
        secondAdultLastName: values.type === "family" ? values.secondAdultLastName : undefined,
        children: values.type === "family" ? values.children : [],
      });
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d&apos;adhésion</FormLabel>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => field.onChange("personal")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    field.value === "personal"
                      ? "border-(--sf-red-700) bg-(--sf-off-white)"
                      : "border-zinc-200 hover:border-(--sf-red-700)",
                  )}
                >
                  <p className="font-semibold text-(--sf-red-800)">Personnel</p>
                  <p className="text-sm text-zinc-600">42$</p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("family")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    field.value === "family"
                      ? "border-(--sf-red-700) bg-(--sf-off-white)"
                      : "border-zinc-200 hover:border-(--sf-red-700)",
                  )}
                >
                  <p className="font-semibold text-(--sf-red-800)">Familial</p>
                  <p className="text-sm text-zinc-600">65$</p>
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="123 rue de la Paix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="514-555-1234" {...field} />
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
                  <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-medium">ℹ️ Validité</p>
          <p>Votre adhésion sera valable 1 an à partir de la date de paiement.</p>
        </div>

        {isFamily && (
          <div className="space-y-4 rounded-lg border border-(--sf-mist-gray) bg-(--sf-off-white)/50 p-4">
            <p className="font-semibold text-(--sf-red-800)">2e adulte</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="secondAdultFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Marie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondAdultLastName"
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
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-(--sf-red-800)">Enfants</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ firstName: "", lastName: "" })}
                >
                  Ajouter un enfant
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-md border bg-white p-3 md:grid-cols-12"
                >
                  <FormField
                    control={form.control}
                    name={`children.${index}.firstName`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-5">
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Alice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`children.${index}.lastName`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-5">
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => remove(index)}
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}

              <FormField
                control={form.control}
                name="children"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="donationEnabled"
          render={({ field }) => (
            <FormItem>
              <div
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  field.value
                    ? "border-(--sf-red-700) bg-(--sf-off-white)"
                    : "border-zinc-200 hover:border-(--sf-red-700)",
                )}
                onClick={() => {
                  const nextValue = !field.value;
                  field.onChange(nextValue);
                  if (!nextValue) {
                    form.setValue("donationAmount", 0);
                  }
                }}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    field.value ? "border-(--sf-red-700) bg-(--sf-red-700)" : "border-zinc-400",
                  )}
                >
                  {field.value && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="w-full">
                  <p className="font-semibold text-(--sf-red-800)">
                    Bonifiez votre adhésion avec un don
                  </p>
                  <p className="mb-2 text-sm text-zinc-600">
                    Un reçu d&apos;impôt sera émis pour tout don supérieur à 20$.
                  </p>
                  <FormField
                    control={form.control}
                    name="donationAmount"
                    render={({ field: amountField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="0"
                            disabled={!field.value}
                            value={amountField.value ?? 0}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              const raw = event.target.value;
                              const parsed = Number.parseInt(raw || "0", 10);
                              amountField.onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormItem>
          )}
        />

        {(() => {
          const donationAmount = form.watch("donationAmount") ?? 0;
          const donationEnabled = form.watch("donationEnabled") ?? false;
          if (donationEnabled && donationAmount > 20) {
            return (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">📄 Reçu fiscal</p>
                <p>Un reçu fiscal sera généré pour votre don de {donationAmount}$.</p>
              </div>
            );
          }
          return null;
        })()}

        <FormField
          control={form.control}
          name="topoMapOrder"
          render={({ field }) => (
            <FormItem>
              <div
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  field.value
                    ? "border-(--sf-red-700) bg-(--sf-off-white)"
                    : "border-zinc-200 hover:border-(--sf-red-700)",
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    field.value ? "border-(--sf-red-700) bg-(--sf-red-700)" : "border-zinc-400",
                  )}
                >
                  {field.value && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-(--sf-red-800)">
                    Carte topographique hydrofuge — 10$
                  </p>
                  <p className="text-sm text-zinc-600">
                    Livraison incluse. Carte haute qualité résistante à l&apos;eau.
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white"
          disabled={loading}
        >
          {loading ? "Création de la session Clover..." : "Passer au paiement Clover"}
        </Button>
      </form>
    </Form>
  );
}
