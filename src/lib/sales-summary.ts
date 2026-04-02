import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { invoiceLine, membership, payment } from "@/db/schema";

export const salesSummaryInputSchema = z
  .object({
    startDate: z.string().date("Date de début invalide"),
    endDate: z.string().date("Date de fin invalide"),
    extraFees: z
      .array(
        z.object({
          accountNumber: z.string().trim().min(1, "Le numéro de compte est requis"),
          title: z.string().trim().min(1, "Le libellé est requis"),
          amount: z.number().positive("Le montant doit etre positif"),
        }),
      )
      .optional()
      .default([]),
    extraRevenues: z
      .array(
        z.object({
          accountNumber: z.string().trim().min(1, "Le numéro de compte est requis"),
          title: z.string().trim().min(1, "Le libellé est requis"),
          amount: z.number().positive("Le montant doit etre positif"),
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((values, ctx) => {
    if (values.startDate > values.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de début doit être antérieure ou égale à la date de fin",
        path: ["startDate"],
      });
    }
  });

export type SalesSummaryInput = z.infer<typeof salesSummaryInputSchema>;

export type SalesSummaryProductLine = {
  accountNumber: "4005" | "4006" | "4050" | "4205";
  title: string;
  unitPrice: number | null;
  quantitySold: number;
  quantityRefunded: number;
  totalSold: number;
  totalRefunded: number;
  totalForAccounting: number;
};

export type SalesSummaryFeeLine = {
  accountNumber: string;
  title: string;
  amount: number;
};

export type SalesSummaryRevenueLine = {
  accountNumber: string;
  title: string;
  amount: number;
};

export type CloverSalesSummary = {
  startDate: string;
  endDate: string;
  generatedAt: string;
  projectCode: string;
  productLines: SalesSummaryProductLine[];
  fees: SalesSummaryFeeLine[];
  revenues: SalesSummaryRevenueLine[];
  productsSoldTotal: number;
  productsRefundedTotal: number;
  productsAccountingTotal: number;
  feesTotal: number;
  revenuesTotal: number;
  bankBalanceTotal: number;
};

type ProductBucket = {
  accountNumber: SalesSummaryProductLine["accountNumber"];
  title: string;
  quantitySold: number;
  quantityRefunded: number;
  totalSold: number;
  totalRefunded: number;
  unitPricesSold: Set<number>;
};

const PRODUCT_ACCOUNT_ORDER: SalesSummaryProductLine["accountNumber"][] = [
  "4005",
  "4006",
  "4050",
  "4205",
];

const PRODUCT_TITLES: Record<SalesSummaryProductLine["accountNumber"], string> = {
  "4005": "Adhésion annuelle individuelle",
  "4006": "Adhésion annuelle familiale",
  "4050": "Don",
  "4205": "Carte topographique hydrofuge",
};

const toCents = (value: number) => Math.round(value * 100);
const fromCents = (value: number) => value / 100;

function resolveAccountNumber(lineType: string, membershipType: "personal" | "family" | null) {
  if (lineType === "membership") {
    return membershipType === "family" ? "4006" : "4005";
  }

  if (lineType === "donation") {
    return "4050";
  }

  if (lineType === "topo_map") {
    return "4205";
  }

  return null;
}

function startOfDay(date: string) {
  return new Date(`${date}T00:00:00`);
}

function nextDay(date: string) {
  const parsed = startOfDay(date);
  parsed.setDate(parsed.getDate() + 1);
  return parsed;
}

export async function buildCloverSalesSummary(
  rawInput: SalesSummaryInput,
): Promise<CloverSalesSummary> {
  const input = salesSummaryInputSchema.parse(rawInput);

  const rows = await db
    .select({
      lineType: invoiceLine.type,
      lineQuantity: invoiceLine.quantity,
      lineAmount: invoiceLine.amount,
      lineUnitPrice: invoiceLine.unitPrice,
      paymentStatus: payment.status,
      membershipType: membership.type,
    })
    .from(payment)
    .innerJoin(invoiceLine, eq(invoiceLine.invoiceId, payment.invoiceId))
    .leftJoin(membership, eq(membership.id, invoiceLine.membershipId))
    .where(
      and(
        eq(payment.provider, "clover"),
        inArray(payment.status, ["approved", "refunded"]),
        inArray(invoiceLine.type, ["membership", "donation", "topo_map"]),
        gte(payment.paidAt, startOfDay(input.startDate)),
        lt(payment.paidAt, nextDay(input.endDate)),
      ),
    );

  const buckets = new Map<SalesSummaryProductLine["accountNumber"], ProductBucket>();

  for (const accountNumber of PRODUCT_ACCOUNT_ORDER) {
    buckets.set(accountNumber, {
      accountNumber,
      title: PRODUCT_TITLES[accountNumber],
      quantitySold: 0,
      quantityRefunded: 0,
      totalSold: 0,
      totalRefunded: 0,
      unitPricesSold: new Set<number>(),
    });
  }

  for (const row of rows) {
    const accountNumber = resolveAccountNumber(row.lineType, row.membershipType);

    if (!accountNumber) {
      continue;
    }

    const bucket = buckets.get(accountNumber);

    if (!bucket) {
      continue;
    }

    const quantity = Number(row.lineQuantity ?? 1);
    const lineAmount = Number(row.lineAmount ?? 0);
    const lineUnitPrice = Number(row.lineUnitPrice ?? 0);

    if (row.paymentStatus === "refunded") {
      bucket.quantityRefunded += quantity;
      bucket.totalRefunded -= lineAmount;
      continue;
    }

    bucket.quantitySold += quantity;
    bucket.totalSold += lineAmount;
    bucket.unitPricesSold.add(lineUnitPrice);
  }

  const productLines = PRODUCT_ACCOUNT_ORDER.map((accountNumber) => {
    const bucket = buckets.get(accountNumber)!;
    const uniqueSoldUnitPrices = Array.from(bucket.unitPricesSold.values());

    return {
      accountNumber,
      title: bucket.title,
      unitPrice: uniqueSoldUnitPrices.length === 1 ? uniqueSoldUnitPrices[0] : null,
      quantitySold: bucket.quantitySold,
      quantityRefunded: bucket.quantityRefunded,
      totalSold: fromCents(toCents(bucket.totalSold)),
      totalRefunded: fromCents(toCents(bucket.totalRefunded)),
      totalForAccounting: fromCents(toCents(bucket.totalSold + bucket.totalRefunded)),
    } satisfies SalesSummaryProductLine;
  });

  const productsSoldTotal = fromCents(
    productLines.reduce((sum, line) => sum + toCents(line.totalSold), 0),
  );
  const productsRefundedTotal = fromCents(
    productLines.reduce((sum, line) => sum + toCents(line.totalRefunded), 0),
  );
  const productsAccountingTotal = fromCents(
    productLines.reduce((sum, line) => sum + toCents(line.totalForAccounting), 0),
  );

  const fees = input.extraFees.map((fee) => ({
    accountNumber: fee.accountNumber,
    title: fee.title,
    amount: fromCents(-toCents(fee.amount)),
  }));

  const revenues = input.extraRevenues.map((revenue) => ({
    accountNumber: revenue.accountNumber,
    title: revenue.title,
    amount: fromCents(toCents(revenue.amount)),
  }));

  const feesTotal = fromCents(fees.reduce((sum, fee) => sum + toCents(fee.amount), 0));
  const revenuesTotal = fromCents(
    revenues.reduce((sum, revenue) => sum + toCents(revenue.amount), 0),
  );
  const bankBalanceTotal = fromCents(toCents(productsAccountingTotal + feesTotal + revenuesTotal));

  return {
    startDate: input.startDate,
    endDate: input.endDate,
    generatedAt: new Date().toISOString(),
    projectCode: "A1",
    productLines,
    fees,
    revenues,
    productsSoldTotal,
    productsRefundedTotal,
    productsAccountingTotal,
    feesTotal,
    revenuesTotal,
    bankBalanceTotal,
  };
}
