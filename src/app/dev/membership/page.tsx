"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type ChangeEvent, useEffect } from "react";

import { MembershipCardPdf } from "@/components/membership/membership-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading PDF preview...
    </div>
  ),
});

interface FormState {
  firstName: string;
  lastName: string;
  type: "personal" | "family";
  secondAdultFirstName: string;
  secondAdultLastName: string;
  child1FirstName: string;
  child1LastName: string;
  child2FirstName: string;
  child2LastName: string;
  child3FirstName: string;
  child3LastName: string;
  paidAt: string;
  membershipId: string;
}

const DEFAULT_FORM: FormState = {
  firstName: "Julien",
  lastName: "Bras",
  type: "family",
  secondAdultFirstName: "Sophie",
  secondAdultLastName: "Martin",
  child1FirstName: "Léa",
  child1LastName: "Bras",
  child2FirstName: "Thomas",
  child2LastName: "Bras",
  child3FirstName: "",
  child3LastName: "",
  paidAt: new Date().toISOString().split("T")[0],
  membershipId: "42",
};

export default function MembershipCardPreviewPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [logoDataUri, setLogoDataUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load logo from public/membre.png
    const loadLogo = async () => {
      try {
        const response = await fetch("/membre.png");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoDataUri(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };

    loadLogo();
  }, []);

  const onChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const onTypeChange = (value: "personal" | "family") => {
    setForm((prev) => ({ ...prev, type: value }));
  };

  const reset = () => setForm(DEFAULT_FORM);

  // Build children array, filtering out empty entries
  const children = [
    {
      firstName: form.child1FirstName,
      lastName: form.child1LastName,
    },
    {
      firstName: form.child2FirstName,
      lastName: form.child2LastName,
    },
    {
      firstName: form.child3FirstName,
      lastName: form.child3LastName,
    },
  ].filter((child) => child.firstName.trim() && child.lastName.trim());

  const payload = useMemo(
    () => ({
      firstName: form.firstName,
      lastName: form.lastName,
      type: form.type,
      paidAt: new Date(form.paidAt),
      secondAdultFirstName:
        form.type === "family" && form.secondAdultFirstName.trim()
          ? form.secondAdultFirstName
          : undefined,
      secondAdultLastName:
        form.type === "family" && form.secondAdultLastName.trim()
          ? form.secondAdultLastName
          : undefined,
      children: form.type === "family" ? children : undefined,
      membershipId: Number(form.membershipId || 1),
      logoDataUri,
    }),
    [form, children, logoDataUri],
  );

  return (
    <div className="grid min-h-screen gap-6 p-6 lg:grid-cols-[380px,1fr]">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Membership Card Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tweak the fields to refresh the card live. Useful to adjust layout without printing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="type">Membership Type</Label>
            <Select value={form.type} onValueChange={onTypeChange}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Individuel</SelectItem>
                <SelectItem value="family">Famille</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={onChange("firstName")}
              placeholder="Prénom"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={onChange("lastName")}
              placeholder="Nom"
            />
          </div>

          {form.type === "family" && (
            <>
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-semibold">Second Adult (optionnel)</p>

                <div className="grid gap-3">
                  <Label htmlFor="secondAdultFirstName">Prénom</Label>
                  <Input
                    id="secondAdultFirstName"
                    value={form.secondAdultFirstName}
                    onChange={onChange("secondAdultFirstName")}
                    placeholder="Prénom"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="secondAdultLastName">Nom</Label>
                  <Input
                    id="secondAdultLastName"
                    value={form.secondAdultLastName}
                    onChange={onChange("secondAdultLastName")}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-semibold">Enfants (optionnel)</p>

                <div>
                  <Label htmlFor="child1FirstName" className="text-xs">
                    Enfant 1 - Prénom
                  </Label>
                  <Input
                    id="child1FirstName"
                    value={form.child1FirstName}
                    onChange={onChange("child1FirstName")}
                    placeholder="Prénom"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="child1LastName" className="text-xs">
                    Enfant 1 - Nom
                  </Label>
                  <Input
                    id="child1LastName"
                    value={form.child1LastName}
                    onChange={onChange("child1LastName")}
                    placeholder="Nom"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="child2FirstName" className="text-xs">
                    Enfant 2 - Prénom
                  </Label>
                  <Input
                    id="child2FirstName"
                    value={form.child2FirstName}
                    onChange={onChange("child2FirstName")}
                    placeholder="Prénom"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="child2LastName" className="text-xs">
                    Enfant 2 - Nom
                  </Label>
                  <Input
                    id="child2LastName"
                    value={form.child2LastName}
                    onChange={onChange("child2LastName")}
                    placeholder="Nom"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="child3FirstName" className="text-xs">
                    Enfant 3 - Prénom
                  </Label>
                  <Input
                    id="child3FirstName"
                    value={form.child3FirstName}
                    onChange={onChange("child3FirstName")}
                    placeholder="Prénom"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label htmlFor="child3LastName" className="text-xs">
                    Enfant 3 - Nom
                  </Label>
                  <Input
                    id="child3LastName"
                    value={form.child3LastName}
                    onChange={onChange("child3LastName")}
                    placeholder="Nom"
                    className="h-8"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid gap-3 border-t pt-4">
            <Label htmlFor="paidAt">Date de paiement</Label>
            <Input id="paidAt" type="date" value={form.paidAt} onChange={onChange("paidAt")} />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="membershipId">ID d'adhésion</Label>
            <Input
              id="membershipId"
              type="number"
              value={form.membershipId}
              onChange={onChange("membershipId")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" onClick={reset} variant="secondary">
              Réinitialiser par défaut
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Aperçu en direct</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="h-[80vh] overflow-hidden rounded-md border">
            <PDFViewer width="100%" height="100%" showToolbar>
              <MembershipCardPdf {...payload} />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
