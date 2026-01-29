"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Contact } from "@/actions/contact";
import { deleteDonation, type DonationWithContact } from "@/actions/donation";
import { useToast } from "@/hooks/use-toast";
import { DonationDialog } from "@/app/admin/season/[id]/donation/donation-dialog";
import { SendDonationReceiptButton } from "@/app/admin/season/[id]/donation/send-donation-receipt-button";

type DonationTableProps = {
  seasonId: number;
  donations: DonationWithContact[];
  contacts: Contact[];
  onRefresh: () => void;
  onContactCreated: (contact: Contact) => void;
};

const formatCurrency = (value: number) =>
  Number(value).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });

const paymentTypeLabel: Record<string, string> = {
  cash: "Espèces",
  check: "Chèque",
  bank_transfer: "Virement",
  other: "Autre",
};

export function DonationTable({
  seasonId,
  donations,
  contacts,
  onRefresh,
  onContactCreated,
}: DonationTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const receiptTitles = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return donations.reduce<Record<number, string>>((acc, donation) => {
      if (donation.receiptStatus === "sent" && donation.receiptSentAt) {
        const date = new Date(donation.receiptSentAt);
        acc[donation.id] = `Reçu envoyé le ${formatter.format(date)}`;
      } else if (donation.receiptStatus === "failed") {
        acc[donation.id] =
          `Échec de l'envoi${donation.receiptError ? ` : ${donation.receiptError}` : ""}`;
      } else {
        acc[donation.id] = "Reçu non envoyé";
      }
      return acc;
    }, {});
  }, [donations]);

  const handleDelete = async (id: number, label: string) => {
    const confirmed = confirm(`Supprimer le don ${label} ?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteDonation(id, seasonId);
      toast({ title: "Don supprimé", description: `${label} a été supprimé.` });
      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce don.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Dons</CardTitle>
        <DonationDialog
          seasonId={seasonId}
          contacts={contacts}
          onSuccess={onRefresh}
          onContactCreated={onContactCreated}
        />
      </CardHeader>
      <CardContent>
        {donations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun don enregistré pour cette saison.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Donateur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-center">Reçu</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    {new Date(donation.date).toLocaleDateString("fr-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {donation.contactFirstName} {donation.contactLastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {donation.contactEmail || ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(donation.amount)}</TableCell>
                  <TableCell className="capitalize">
                    {paymentTypeLabel[donation.paymentType] ?? donation.paymentType}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs whitespace-pre-line">
                    {donation.notes || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {donation.receiptStatus === "sent" ? (
                        <span title={receiptTitles[donation.id]}>
                          <CheckCircle2
                            className="h-5 w-5 text-emerald-600"
                            aria-label={receiptTitles[donation.id]}
                          />
                        </span>
                      ) : (
                        <span title={receiptTitles[donation.id]}>
                          <XCircle
                            className={`h-5 w-5 ${donation.receiptStatus === "failed" ? "text-destructive" : "text-muted-foreground"}`}
                            aria-label={receiptTitles[donation.id]}
                          />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SendDonationReceiptButton
                        donationId={donation.id}
                        contactEmail={donation.contactEmail}
                        onSuccess={onRefresh}
                      />
                      <DonationDialog
                        seasonId={seasonId}
                        contacts={contacts}
                        donation={donation}
                        onSuccess={onRefresh}
                        onContactCreated={onContactCreated}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            donation.id,
                            `${donation.contactFirstName} ${donation.contactLastName} (${formatCurrency(donation.amount)})`,
                          )
                        }
                        disabled={deletingId === donation.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
