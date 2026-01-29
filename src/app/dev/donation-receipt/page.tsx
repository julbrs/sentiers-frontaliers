"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type ChangeEvent } from "react";

import { DonationReceiptPdf } from "@/components/donation/donation-receipt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading PDF preview...
    </div>
  ),
});

interface FormState {
  donorFirstName: string;
  donorLastName: string;
  address: string;
  seasonName: string;
  amount: string;
  date: string;
  donationId: string;
}

const DEFAULT_FORM: FormState = {
  donorFirstName: "Julien",
  donorLastName: "Bras",
  address: "13 rue Bowen Sud, Sherbrooke, QC, J1G 2E8",
  seasonName: "2025",
  amount: "150.00",
  date: "2025-05-15",
  donationId: "12",
};

export default function DonationReceiptPreviewPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const onChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const reset = () => setForm(DEFAULT_FORM);

  const payload = useMemo(
    () => ({
      donorFirstName: form.donorFirstName,
      donorLastName: form.donorLastName,
      address: form.address || null,
      seasonName: form.seasonName,
      amount: Number(form.amount || 0),
      date: form.date,
      donationId: Number(form.donationId || 0),
    }),
    [form],
  );

  return (
    <div className="grid min-h-screen gap-6 p-6 lg:grid-cols-[380px,1fr]">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>PDF settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tweak the fields to refresh the PDF live. Useful to adjust layout without sending
            emails.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="donorFirstName">Donor first name</Label>
            <Input
              id="donorFirstName"
              value={form.donorFirstName}
              onChange={onChange("donorFirstName")}
              placeholder="First name"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="donorLastName">Donor last name</Label>
            <Input
              id="donorLastName"
              value={form.donorLastName}
              onChange={onChange("donorLastName")}
              placeholder="Last name"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={form.address}
              onChange={onChange("address")}
              placeholder="Full address"
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="seasonName">Saison</Label>
            <Input
              id="seasonName"
              value={form.seasonName}
              onChange={onChange("seasonName")}
              placeholder="2024-2025"
            />
          </div>

          {/* <div className="grid gap-3"> */}
          <div className="grid gap-3">
            <Label htmlFor="amount">Montant admissible ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={onChange("amount")}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="date">Date du don</Label>
            <Input id="date" type="date" value={form.date} onChange={onChange("date")} />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="donationId">Donation ID</Label>
            <Input
              id="donationId"
              type="number"
              value={form.donationId}
              onChange={onChange("donationId")}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" onClick={reset} variant="secondary">
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="h-[80vh] overflow-hidden rounded-md border">
            <PDFViewer width="100%" height="100%" showToolbar>
              <DonationReceiptPdf {...payload} />
            </PDFViewer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
