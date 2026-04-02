"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { contact, donation, donationReceipt, invoice, invoiceLine, payment } from "@/db/schema";
import { checkAdmin } from "@/lib/auth-server";

type PaymentType = "cash" | "check" | "bank_transfer" | "card" | "other";

export type DonationInput = {
  seasonId: number;
  contactId: number;
  amount: number;
  paymentType: PaymentType;
  date: string; // ISO yyyy-mm-dd
  notes?: string | null;
};

export type DonationRecord = {
  id: number;
  seasonId: number;
  donatorId: number;
  amount: number;
  paymentType: PaymentType;
  date: string;
  notes: string | null;
};

export type DonationReceiptStatus = "sent" | "failed" | "pending";

export type DonationWithContact = DonationRecord & {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  receiptStatus: DonationReceiptStatus | null;
  receiptSentAt: Date | null;
  receiptError: string | null;
};

const normalizeAmount = (value: number) => Number(value || 0).toFixed(2);
const todayTimestamp = () => new Date();

const donationListPath = (seasonId: number) => `/admin/season/${seasonId}/donation`;

export const getDonationsBySeason = async (seasonId: number) => {
  await checkAdmin();
  const rows = await db
    .select({
      id: donation.id,
      amount: invoiceLine.amount,
      paymentType: payment.paymentType,
      date: payment.paymentDate,
      legacyDate: donation.date,
      notes: donation.notes,
      donatorId: donation.donatorId,
      seasonId: donation.seasonId,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      contactEmail: contact.email,
      contactPhone: contact.phone,
      contactAddress: contact.address,
      receiptStatus: donationReceipt.status,
      receiptSentAt: donationReceipt.sentAt,
      receiptError: donationReceipt.errorMessage,
    })
    .from(donation)
    .innerJoin(contact, eq(donation.donatorId, contact.id))
    .leftJoin(invoiceLine, eq(invoiceLine.donationId, donation.id))
    .leftJoin(invoice, eq(invoice.id, invoiceLine.invoiceId))
    .leftJoin(payment, eq(payment.invoiceId, invoice.id))
    .leftJoin(donationReceipt, eq(donationReceipt.donationId, donation.id))
    .where(eq(donation.seasonId, seasonId))
    .orderBy(asc(donation.date), asc(donation.id));

  return rows.map((row) => ({
    ...row,
    amount: Number(row.amount ?? 0),
    paymentType: (row.paymentType ?? "other") as PaymentType,
    date: row.date ?? row.legacyDate,
  })) as DonationWithContact[];
};

export const createDonation = async (input: DonationInput) => {
  await checkAdmin();
  const [createdDonation] = await db
    .insert(donation)
    .values({
      seasonId: input.seasonId,
      donatorId: input.contactId,
      amount: normalizeAmount(input.amount),
      paymentType: input.paymentType,
      date: input.date,
      notes: input.notes ?? null,
    })
    .returning();

  const [createdInvoice] = await db
    .insert(invoice)
    .values({
      source: "donation",
      contactId: input.contactId,
      seasonId: input.seasonId,
      subtotal: normalizeAmount(input.amount),
      total: normalizeAmount(input.amount),
      status: "paid",
      paidAt: todayTimestamp(),
    })
    .returning({ id: invoice.id });

  await db.insert(invoiceLine).values({
    invoiceId: createdInvoice.id,
    type: "donation",
    label: "Don",
    quantity: 1,
    unitPrice: normalizeAmount(input.amount),
    amount: normalizeAmount(input.amount),
    donationId: createdDonation.id,
  });

  await db.insert(payment).values({
    invoiceId: createdInvoice.id,
    status: "approved",
    paymentType: input.paymentType,
    provider: "manual",
    amount: normalizeAmount(input.amount),
    paymentDate: input.date,
    paidAt: todayTimestamp(),
  });

  revalidatePath(donationListPath(input.seasonId));
  return {
    ...createdDonation,
    amount: Number(createdDonation.amount),
  } as DonationRecord;
};

export const updateDonation = async (id: number, input: Partial<DonationInput>) => {
  await checkAdmin();
  const [existingDonation] = await db
    .select({
      seasonId: donation.seasonId,
      amount: donation.amount,
      paymentType: donation.paymentType,
      date: donation.date,
      donatorId: donation.donatorId,
    })
    .from(donation)
    .where(eq(donation.id, id))
    .limit(1);

  const [updated] = await db
    .update(donation)
    .set({
      seasonId: input.seasonId,
      donatorId: input.contactId,
      amount: input.amount != null ? normalizeAmount(input.amount) : undefined,
      paymentType: input.paymentType,
      date: input.date,
      notes: input.notes ?? undefined,
    })
    .where(eq(donation.id, id))
    .returning();

  const [billing] = await db
    .select({
      invoiceId: invoice.id,
    })
    .from(invoiceLine)
    .innerJoin(invoice, eq(invoice.id, invoiceLine.invoiceId))
    .where(eq(invoiceLine.donationId, id))
    .limit(1);

  if (billing?.invoiceId) {
    const normalizedAmount = normalizeAmount(input.amount ?? Number(updated.amount));

    await db
      .update(invoice)
      .set({
        contactId: input.contactId ?? updated.donatorId,
        seasonId: input.seasonId ?? updated.seasonId,
        subtotal: normalizedAmount,
        total: normalizedAmount,
      })
      .where(eq(invoice.id, billing.invoiceId));

    await db
      .update(invoiceLine)
      .set({
        unitPrice: normalizedAmount,
        amount: normalizedAmount,
      })
      .where(eq(invoiceLine.invoiceId, billing.invoiceId));

    await db
      .update(payment)
      .set({
        paymentType: input.paymentType ?? updated.paymentType,
        amount: normalizedAmount,
        paymentDate: input.date ?? updated.date,
        paidAt: todayTimestamp(),
      })
      .where(eq(payment.invoiceId, billing.invoiceId));
  }

  if (existingDonation?.seasonId && existingDonation.seasonId !== updated.seasonId) {
    revalidatePath(donationListPath(existingDonation.seasonId));
  }

  revalidatePath(donationListPath(updated.seasonId));

  return {
    ...updated,
    amount: Number(updated.amount),
  } as DonationRecord;
};

export const deleteDonation = async (id: number, seasonId: number) => {
  await checkAdmin();

  const [billing] = await db
    .select({
      invoiceId: invoiceLine.invoiceId,
    })
    .from(invoiceLine)
    .where(eq(invoiceLine.donationId, id))
    .limit(1);

  if (billing?.invoiceId) {
    await db.delete(invoice).where(eq(invoice.id, billing.invoiceId));
  }

  await db.delete(donation).where(eq(donation.id, id));

  revalidatePath(donationListPath(seasonId));
};
