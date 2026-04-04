"use server";

import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  contact,
  donation,
  donationReceipt,
  invoice,
  invoiceLine,
  payment,
  season,
} from "@/db/schema";
import { checkAdmin, requireSession } from "@/lib/auth-server";

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
const todayDateIso = () => new Date().toISOString().slice(0, 10);

const donationListPath = (seasonId: number) => `/admin/season/${seasonId}/donation`;

const donationCheckoutInputSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
  address: z.string().trim().min(1, "L'adresse est requise"),
  amount: z.number().positive("Le montant doit être supérieur à 0"),
});

export type CreateDonationCheckoutInput = z.infer<typeof donationCheckoutInputSchema>;

function buildAppUrl(headerBag: Headers) {
  const explicitAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (explicitAppUrl) {
    return explicitAppUrl;
  }

  const host = headerBag.get("x-forwarded-host") ?? headerBag.get("host");
  const proto = headerBag.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

async function getCurrentSeasonId() {
  const today = todayDateIso();
  const [currentSeason] = await db
    .select({ id: season.id })
    .from(season)
    .where(and(lte(season.startDate, today), gte(season.endDate, today)))
    .orderBy(desc(season.startDate), desc(season.id))
    .limit(1);

  if (currentSeason) {
    return currentSeason.id;
  }

  const [latestSeason] = await db
    .select({ id: season.id })
    .from(season)
    .orderBy(desc(season.endDate), desc(season.id))
    .limit(1);

  if (!latestSeason) {
    throw new Error("Aucune saison n'est configurée. Contactez un administrateur.");
  }

  return latestSeason.id;
}

async function upsertContactByEmail(params: {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
}) {
  const [existingContact] = await db
    .select({ id: contact.id })
    .from(contact)
    .where(sql`lower(${contact.email}) = lower(${params.email})`)
    .limit(1);

  if (existingContact) {
    await db
      .update(contact)
      .set({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        address: params.address,
      })
      .where(eq(contact.id, existingContact.id));

    return existingContact.id;
  }

  const [createdContact] = await db
    .insert(contact)
    .values({
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      address: params.address,
    })
    .returning({ id: contact.id });

  return createdContact.id;
}

async function createCloverDonationHostedCheckout(params: {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  invoiceId: number;
}) {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const privateToken = process.env.CLOVER_PRIVATE_TOKEN;
  const apiBaseUrl = process.env.CLOVER_API_BASE_URL || "https://apisandbox.dev.clover.com";

  if (!merchantId || !privateToken) {
    throw new Error("Clover n'est pas configuré (CLOVER_MERCHANT_ID / CLOVER_PRIVATE_TOKEN)");
  }

  const appUrl = buildAppUrl(await headers());

  const payload = {
    currency: "CAD",
    customer: {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
    },
    tips: {
      enabled: false,
    },
    shoppingCart: {
      lineItems: [
        {
          name: "Don",
          note: `Facture #${params.invoiceId} - ${params.firstName} ${params.lastName}`,
          price: Math.round(params.amount * 100),
          unitQty: 1,
        },
      ],
    },
    redirectUrls:
      appUrl === "http://localhost:3000"
        ? undefined
        : {
            success: `${appUrl}/don?donation=success`,
            failure: `${appUrl}/don?donation=failed`,
          },
  };

  const response = await fetch(`${apiBaseUrl}/invoicingcheckoutservice/v1/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateToken}`,
      "X-Clover-Merchant-Id": merchantId,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erreur Clover (${response.status}): ${body || response.statusText}`);
  }

  const data = (await response.json()) as {
    href?: string;
    checkoutSessionId?: string;
  };

  if (!data.href) {
    throw new Error("Clover n'a pas retourné de lien de paiement");
  }

  return {
    href: data.href,
    checkoutSessionId: data.checkoutSessionId ?? null,
  };
}

export const createDonationCheckout = async (input: CreateDonationCheckoutInput) => {
  const session = await requireSession();
  const parsed = donationCheckoutInputSchema.parse(input);
  const userEmail = session.user.email;

  if (!userEmail) {
    throw new Error("Votre compte doit avoir une adresse email valide pour procéder au don.");
  }

  const amount = Number(parsed.amount.toFixed(2));
  const seasonId = await getCurrentSeasonId();
  const contactId = await upsertContactByEmail({
    email: userEmail,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    address: parsed.address,
  });

  const [createdInvoice] = await db
    .insert(invoice)
    .values({
      source: "donation",
      userId: session.user.id,
      contactId,
      seasonId,
      subtotal: normalizeAmount(amount),
      total: normalizeAmount(amount),
      status: "pending",
    })
    .returning({ id: invoice.id });

  try {
    await db.insert(invoiceLine).values({
      invoiceId: createdInvoice.id,
      type: "donation",
      label: `Don - ${parsed.firstName} ${parsed.lastName}`,
      quantity: 1,
      unitPrice: normalizeAmount(amount),
      amount: normalizeAmount(amount),
    });

    const checkout = await createCloverDonationHostedCheckout({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: userEmail,
      amount,
      invoiceId: createdInvoice.id,
    });

    await db.insert(payment).values({
      invoiceId: createdInvoice.id,
      status: "pending",
      paymentType: "card",
      provider: "clover",
      providerSessionId: checkout.checkoutSessionId,
      providerCheckoutUrl: checkout.href,
      amount: normalizeAmount(amount),
    });

    await db
      .update(invoiceLine)
      .set({
        label: `Don - ${parsed.firstName} ${parsed.lastName}`,
      })
      .where(eq(invoiceLine.invoiceId, createdInvoice.id));

    revalidatePath("/don");
    return checkout.href;
  } catch (error) {
    await db.update(invoice).set({ status: "failed" }).where(eq(invoice.id, createdInvoice.id));

    await db
      .update(payment)
      .set({ status: "failed" })
      .where(eq(payment.invoiceId, createdInvoice.id));

    revalidatePath("/don");
    throw error;
  }
};

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
