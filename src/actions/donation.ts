"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { donation, contact, donationReceipt } from "@/db/schema";
import { checkAdmin } from "@/lib/auth-server";

type PaymentType = "cash" | "check" | "bank_transfer" | "other";

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

const donationListPath = (seasonId: number) => `/admin/season/${seasonId}/donation`;

export const getDonationsBySeason = async (seasonId: number) => {
  await checkAdmin();
  const rows = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      paymentType: donation.paymentType,
      date: donation.date,
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
    .leftJoin(donationReceipt, eq(donationReceipt.donationId, donation.id))
    .where(eq(donation.seasonId, seasonId))
    .orderBy(asc(donation.date), asc(donation.id));

  return rows.map((row) => ({
    ...row,
    amount: Number(row.amount),
  })) as DonationWithContact[];
};

export const createDonation = async (input: DonationInput) => {
  await checkAdmin();
  const [created] = await db
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

  revalidatePath(donationListPath(input.seasonId));
  return {
    ...created,
    amount: Number(created.amount),
  } as DonationRecord;
};

export const updateDonation = async (id: number, input: Partial<DonationInput>) => {
  await checkAdmin();
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

  const seasonId = input.seasonId ?? updated.seasonId;
  if (seasonId) {
    revalidatePath(donationListPath(seasonId));
  }

  return {
    ...updated,
    amount: Number(updated.amount),
  } as DonationRecord;
};

export const deleteDonation = async (id: number, seasonId: number) => {
  await checkAdmin();
  await db.delete(donation).where(eq(donation.id, id));
  revalidatePath(donationListPath(seasonId));
};
