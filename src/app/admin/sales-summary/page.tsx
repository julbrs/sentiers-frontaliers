"use client";

import { useMemo, useState } from "react";
import { FileDown, Plus, ReceiptText, Trash2 } from "lucide-react";

import { getCloverSalesSummary } from "@/actions/sales-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CloverSalesSummary, type SalesSummaryInput } from "@/lib/sales-summary";

type ExtraFeeInput = {
  id: string;
  accountNumber: string;
  title: string;
  amount: string;
};

type ManualRevenueInput = {
  id: string;
  accountNumber: string;
  title: string;
  amount: string;
};

const DEFAULT_EXTRA_FEES: ExtraFeeInput[] = [
  {
    id: "default-fee-5620",
    accountNumber: "5620",
    title: "Frais Location terminal de paiement Clover",
    amount: "0",
  },
  {
    id: "default-fee-5815",
    accountNumber: "5815",
    title: "Frais plateforme de paiement",
    amount: "0",
  },
];

const moneyFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function monthBounds(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

  return {
    startDate: toDateInput(first),
    endDate: toDateInput(last),
  };
}

function buildPayload(
  startDate: string,
  endDate: string,
  extraFees: ExtraFeeInput[],
  extraRevenues: ManualRevenueInput[],
): SalesSummaryInput {
  return {
    startDate,
    endDate,
    extraFees: extraFees
      .filter((fee) => fee.accountNumber.trim() && fee.title.trim() && Number(fee.amount) > 0)
      .map((fee) => ({
        accountNumber: fee.accountNumber.trim(),
        title: fee.title.trim(),
        amount: Number(fee.amount),
      })),
    extraRevenues: extraRevenues
      .filter(
        (revenue) =>
          revenue.accountNumber.trim() && revenue.title.trim() && Number(revenue.amount) > 0,
      )
      .map((revenue) => ({
        accountNumber: revenue.accountNumber.trim(),
        title: revenue.title.trim(),
        amount: Number(revenue.amount),
      })),
  };
}

export default function AdminSalesSummaryPage() {
  const defaults = useMemo(() => monthBounds(), []);

  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [summary, setSummary] = useState<CloverSalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraFees, setExtraFees] = useState<ExtraFeeInput[]>(DEFAULT_EXTRA_FEES);
  const [manualRevenues, setManualRevenues] = useState<ManualRevenueInput[]>([]);

  const addFee = () => {
    setExtraFees((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        accountNumber: "",
        title: "",
        amount: "",
      },
    ]);
  };

  const removeFee = (id: string) => {
    setExtraFees((current) => current.filter((fee) => fee.id !== id));
  };

  const updateFee = (id: string, field: keyof Omit<ExtraFeeInput, "id">, value: string) => {
    setExtraFees((current) =>
      current.map((fee) => (fee.id === id ? { ...fee, [field]: value } : fee)),
    );
  };

  const addManualRevenue = () => {
    setManualRevenues((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        accountNumber: "",
        title: "",
        amount: "",
      },
    ]);
  };

  const removeManualRevenue = (id: string) => {
    setManualRevenues((current) => current.filter((revenue) => revenue.id !== id));
  };

  const updateManualRevenue = (
    id: string,
    field: keyof Omit<ManualRevenueInput, "id">,
    value: string,
  ) => {
    setManualRevenues((current) =>
      current.map((revenue) => (revenue.id === id ? { ...revenue, [field]: value } : revenue)),
    );
  };

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCloverSalesSummary(
        buildPayload(startDate, endDate, extraFees, manualRevenues),
      );
      setSummary(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la génération";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/sales-summary/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload(startDate, endDate, extraFees, manualRevenues)),
      });

      if (!response.ok) {
        const fallbackMessage = "Erreur lors de l'export PDF";
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? fallbackMessage);
      }

      const blob = await response.blob();
      const fileName = `resume_ventes_clover_${startDate}_${endDate}.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'export PDF";
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ReceiptText className="h-6 w-6 text-(--sf-red-700)" />
          Résumé des ventes Clover
        </h1>
        <p className="text-muted-foreground mt-2">
          Exportez vos ventes en ligne entre deux dates pour conciliation bancaire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Période</CardTitle>
          <CardDescription>
            Choisissez les dates de début et de fin (souvent un mois).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button
            className="bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white"
            onClick={generateSummary}
            disabled={loading}
          >
            {loading ? "Génération..." : "Générer le résumé"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frais supplémentaires</CardTitle>
          <CardDescription>Ajoutez des lignes de frais manuelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extraFees.map((fee) => (
            <div className="grid gap-3 md:grid-cols-12" key={fee.id}>
              <Input
                className="md:col-span-2"
                placeholder="Compte"
                value={fee.accountNumber}
                onChange={(event) => updateFee(fee.id, "accountNumber", event.target.value)}
              />
              <Input
                className="md:col-span-6"
                placeholder="Libellé"
                value={fee.title}
                onChange={(event) => updateFee(fee.id, "title", event.target.value)}
              />
              <Input
                className="md:col-span-3"
                type="number"
                min="0"
                step="0.01"
                placeholder="Montant"
                value={fee.amount}
                onChange={(event) => updateFee(fee.id, "amount", event.target.value)}
              />
              <Button
                className="md:col-span-1"
                variant="outline"
                onClick={() => removeFee(fee.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addFee} type="button" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une ligne de frais
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recettes manuelles</CardTitle>
          <CardDescription>Ajoutez des lignes de recettes manuelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {manualRevenues.map((revenue) => (
            <div className="grid gap-3 md:grid-cols-12" key={revenue.id}>
              <Input
                className="md:col-span-2"
                placeholder="Compte"
                value={revenue.accountNumber}
                onChange={(event) =>
                  updateManualRevenue(revenue.id, "accountNumber", event.target.value)
                }
              />
              <Input
                className="md:col-span-6"
                placeholder="Libellé"
                value={revenue.title}
                onChange={(event) => updateManualRevenue(revenue.id, "title", event.target.value)}
              />
              <Input
                className="md:col-span-3"
                type="number"
                min="0"
                step="0.01"
                placeholder="Montant"
                value={revenue.amount}
                onChange={(event) => updateManualRevenue(revenue.id, "amount", event.target.value)}
              />
              <Button
                className="md:col-span-1"
                variant="outline"
                onClick={() => removeManualRevenue(revenue.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addManualRevenue} type="button" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une ligne de recette
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {summary && (
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Tableau de résumé</CardTitle>
              <CardDescription>
                Période du {summary.startDate} au {summary.endDate}
              </CardDescription>
            </div>
            <Button
              className="bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white gap-2"
              onClick={exportPdf}
              disabled={exporting}
            >
              <FileDown className="h-4 w-4" />
              {exporting ? "Export en cours..." : "Exporter en PDF"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Qt. vendues</TableHead>
                  <TableHead className="text-right">Qt. remboursées</TableHead>
                  <TableHead className="text-right">Total vendu</TableHead>
                  <TableHead className="text-right">Total remboursé</TableHead>
                  <TableHead className="text-right">Total comptabilité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.productLines.map((line) => (
                  <TableRow key={`${line.accountNumber}-${line.title}`}>
                    <TableCell>{line.accountNumber}</TableCell>
                    <TableCell>{summary.projectCode}</TableCell>
                    <TableCell>{line.title}</TableCell>
                    <TableCell className="text-right">
                      {line.unitPrice == null ? "-" : formatMoney(line.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">{line.quantitySold}</TableCell>
                    <TableCell className="text-right">
                      {line.quantityRefunded > 0 ? line.quantityRefunded : "-"}
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(line.totalSold)}</TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatMoney(line.totalRefunded)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMoney(line.totalForAccounting)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-semibold">
                  <TableCell colSpan={6}>Total des produits</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(summary.productsSoldTotal)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatMoney(summary.productsRefundedTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(summary.productsAccountingTotal)}
                  </TableCell>
                </TableRow>

                {summary.fees.map((fee, index) => (
                  <TableRow key={`${fee.accountNumber}-${index}`}>
                    <TableCell>{fee.accountNumber}</TableCell>
                    <TableCell>{summary.projectCode}</TableCell>
                    <TableCell>{fee.title}</TableCell>
                    <TableCell colSpan={4} />
                    <TableCell className="text-right text-red-600">
                      {formatMoney(fee.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMoney(fee.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {summary.revenues.map((revenue, index) => (
                  <TableRow key={`${revenue.accountNumber}-${index}`}>
                    <TableCell>{revenue.accountNumber}</TableCell>
                    <TableCell>{summary.projectCode}</TableCell>
                    <TableCell>{revenue.title}</TableCell>
                    <TableCell colSpan={4} />
                    <TableCell className="text-right text-green-700">
                      {formatMoney(revenue.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      {formatMoney(revenue.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-bold text-base">
                  <TableCell>1010</TableCell>
                  <TableCell>{summary.projectCode}</TableCell>
                  <TableCell>Balance versée sur le compte bancaire</TableCell>
                  <TableCell colSpan={5} />
                  <TableCell className="text-right">
                    {formatMoney(summary.bankBalanceTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
