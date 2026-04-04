"use server";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { invoice, invoiceLine, membership, membershipChild, payment } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { PRICE_BY_TYPE, TOPO_MAP_PRICE } from "@/constants";

const childSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom de l'enfant est requis"),
  lastName: z.string().trim().min(1, "Le nom de l'enfant est requis"),
});

const membershipInputSchema = z
  .object({
    type: z.enum(["personal", "family", "corporate"]),
    firstName: z.string().trim().min(1, "Le prenom est requis"),
    lastName: z.string().trim().min(1, "Le nom est requis"),
    address: z.string().trim().min(1, "L'adresse est requise"),
    phone: z.string().trim().min(1, "Le telephone est requis"),
    email: z.string().trim().email("Adresse email invalide"),
    donationAmount: z.number().optional().default(0),
    topoMapOrder: z.boolean().optional().default(false),
    secondAdultFirstName: z.string().trim().optional(),
    secondAdultLastName: z.string().trim().optional(),
    children: z.array(childSchema).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== "family") {
      return;
    }

    if (!values.secondAdultFirstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prenom du 2e adulte est requis",
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

    if (!values.children || values.children.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Au moins un enfant est requis pour une adhésion familiale",
        path: ["children"],
      });
    }
  });

export type MembershipType = keyof typeof PRICE_BY_TYPE;

export type MembershipWithChildren = {
  id: number;
  userId: string;
  type: MembershipType;
  status: "pending" | "paid" | "failed" | "cancelled";
  price: number;
  donationAmount: number | null;
  topoMapOrder: boolean;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  secondAdultFirstName: string | null;
  secondAdultLastName: string | null;
  cloverCheckoutId: string | null;
  cloverCheckoutUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  children: Array<{ id: number; firstName: string; lastName: string }>;
};

export type CreateMembershipInput = z.infer<typeof membershipInputSchema>;

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

async function createCloverHostedCheckout(params: {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: MembershipType;
  membershipId: number;
  amount: number;
  donationAmount?: number;
  topoMapOrder?: boolean;
}) {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const privateToken = process.env.CLOVER_PRIVATE_TOKEN;
  const apiBaseUrl = process.env.CLOVER_API_BASE_URL || "https://apisandbox.dev.clover.com";

  if (!merchantId || !privateToken) {
    throw new Error("Clover n'est pas configure (CLOVER_MERCHANT_ID / CLOVER_PRIVATE_TOKEN)");
  }

  const appUrl = buildAppUrl(await headers());
  const membershipAmountInCents = Math.round(params.amount * 100);
  const donationAmountInCents = Math.round((params.donationAmount ?? 0) * 100);

  const lineItems = [
    {
      name:
        params.membershipType === "family"
          ? "Adhésion familiale"
          : params.membershipType === "corporate"
            ? "Adhésion corporative"
            : "Adhésion individuelle",
      note: `Membership #${params.membershipId} - ${params.fullName}`,
      price: membershipAmountInCents,
      unitQty: 1,
    },
  ];

  if (donationAmountInCents > 0) {
    lineItems.push({
      name: "Don",
      note: "Contribution volontaire",
      price: donationAmountInCents,
      unitQty: 1,
    });
  }

  if (params.topoMapOrder) {
    lineItems.push({
      name: "Carte topographique hydrofuge",
      note: "Livraison incluse",
      price: Math.round(TOPO_MAP_PRICE * 100),
      unitQty: 1,
    });
  }

  const payload = {
    currency: "CAD",
    customer: {
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      phoneNumber: params.phone,
    },
    tips: {
      enabled: false,
    },
    shoppingCart: {
      lineItems,
    },
    redirectUrls:
      appUrl === "http://localhost:3000"
        ? undefined
        : {
            success: `${appUrl}/profile?membership=success`,
            failure: `${appUrl}/profile?membership=failed`,
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
    throw new Error("Clover n'a pas retourne de lien de paiement");
  }

  return {
    href: data.href,
    checkoutSessionId: data.checkoutSessionId ?? null,
  };
}

export const createMembershipCheckout = async (input: CreateMembershipInput) => {
  const session = await requireSession();
  const parsed = membershipInputSchema.parse(input);
  const amount = PRICE_BY_TYPE[parsed.type];
  const donationAmount = parsed.donationAmount ?? 0;
  const topoMapOrder = parsed.topoMapOrder ?? false;
  const topoMapAmount = topoMapOrder ? TOPO_MAP_PRICE : 0;
  const totalAmount = amount + donationAmount + topoMapAmount;

  const [createdMembership] = await db
    .insert(membership)
    .values({
      userId: session.user.id,
      type: parsed.type,
      status: "pending",
      price: amount.toFixed(2),
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      address: parsed.address,
      phone: parsed.phone,
      email: parsed.email,
      secondAdultFirstName: parsed.type === "family" ? (parsed.secondAdultFirstName ?? null) : null,
      secondAdultLastName: parsed.type === "family" ? (parsed.secondAdultLastName ?? null) : null,
    })
    .returning();

  if (parsed.type === "family" && parsed.children?.length) {
    await db.insert(membershipChild).values(
      parsed.children.map((child) => ({
        membershipId: createdMembership.id,
        firstName: child.firstName,
        lastName: child.lastName,
      })),
    );
  }

  try {
    const checkout = await createCloverHostedCheckout({
      fullName: `${parsed.firstName} ${parsed.lastName}`,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      membershipType: parsed.type,
      membershipId: createdMembership.id,
      amount,
      donationAmount,
      topoMapOrder,
    });

    const [createdInvoice] = await db
      .insert(invoice)
      .values({
        source: "membership",
        userId: session.user.id,
        total: totalAmount.toFixed(2),
        subtotal: totalAmount.toFixed(2),
        status: "pending",
      })
      .returning({ id: invoice.id });

    await db.insert(invoiceLine).values({
      invoiceId: createdInvoice.id,
      type: "membership",
      label:
        parsed.type === "family"
          ? "Adhésion familiale"
          : parsed.type === "corporate"
            ? "Adhésion corporative"
            : "Adhésion individuelle",
      quantity: 1,
      unitPrice: amount.toFixed(2),
      amount: amount.toFixed(2),
      membershipId: createdMembership.id,
    });

    if (donationAmount > 0) {
      await db.insert(invoiceLine).values({
        invoiceId: createdInvoice.id,
        type: "donation",
        label: "Don",
        quantity: 1,
        unitPrice: donationAmount.toFixed(2),
        amount: donationAmount.toFixed(2),
      });
    }

    if (topoMapOrder) {
      await db.insert(invoiceLine).values({
        invoiceId: createdInvoice.id,
        type: "topo_map",
        label: "Carte topographique hydrofuge",
        quantity: 1,
        unitPrice: TOPO_MAP_PRICE.toFixed(2),
        amount: TOPO_MAP_PRICE.toFixed(2),
      });
    }

    await db.insert(payment).values({
      invoiceId: createdInvoice.id,
      status: "pending",
      paymentType: "card",
      provider: "clover",
      providerSessionId: checkout.checkoutSessionId,
      providerCheckoutUrl: checkout.href,
      amount: totalAmount.toFixed(2),
    });

    revalidatePath("/profile");
    return checkout.href;
  } catch (error) {
    await db
      .update(membership)
      .set({
        status: "failed",
      })
      .where(eq(membership.id, createdMembership.id));

    revalidatePath("/profile");
    throw error;
  }
};

export const deletePendingMembership = async (checkoutSessionId: string) => {
  const session = await requireSession();

  const membershipToDelete = await db
    .select()
    .from(invoice)
    .innerJoin(invoiceLine, eq(invoiceLine.invoiceId, invoice.id))
    .innerJoin(payment, eq(payment.invoiceId, invoice.id))
    .innerJoin(membership, eq(membership.id, invoiceLine.membershipId))
    .where(eq(payment.providerSessionId, checkoutSessionId))
    .limit(1);

  if (!membershipToDelete.length) {
    return { deleted: false, reason: "Membership not found" };
  }

  const m = membershipToDelete[0].membership;
  const membershipInvoice = membershipToDelete[0].invoice;

  if (m.userId !== session.user.id) {
    return { deleted: false, reason: "Unauthorized" };
  }

  if (m.status !== "pending" || membershipInvoice.status !== "pending") {
    return { deleted: false, reason: "Membership is not pending" };
  }

  if (m.type === "family") {
    await db.delete(membershipChild).where(eq(membershipChild.membershipId, m.id));
  }

  await db.delete(membership).where(eq(membership.id, m.id));
  await db.delete(invoice).where(eq(invoice.id, membershipInvoice.id));

  revalidatePath("/profile");
  return { deleted: true };
};

export const getMyMemberships = async (): Promise<MembershipWithChildren[]> => {
  const session = await requireSession();

  const memberships = await db
    .select({
      id: membership.id,
      userId: membership.userId,
      type: membership.type,
      status: membership.status,
      price: membership.price,
      invoiceId: invoice.id,
      firstName: membership.firstName,
      lastName: membership.lastName,
      address: membership.address,
      phone: membership.phone,
      email: membership.email,
      secondAdultFirstName: membership.secondAdultFirstName,
      secondAdultLastName: membership.secondAdultLastName,
      cloverCheckoutId: payment.providerSessionId,
      cloverCheckoutUrl: payment.providerCheckoutUrl,
      paidAt: invoice.paidAt,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    })
    .from(membership)
    .leftJoin(invoiceLine, eq(invoiceLine.membershipId, membership.id))
    .leftJoin(invoice, eq(invoice.id, invoiceLine.invoiceId))
    .leftJoin(payment, eq(payment.invoiceId, invoice.id))
    .where(eq(membership.userId, session.user.id))
    .orderBy(desc(membership.createdAt), asc(membership.id));

  if (!memberships.length) {
    return [];
  }

  const invoiceIds = memberships
    .map((row) => row.invoiceId)
    .filter((id): id is number => id != null);
  const lineRows = invoiceIds.length
    ? await db
        .select({
          invoiceId: invoiceLine.invoiceId,
          type: invoiceLine.type,
          amount: invoiceLine.amount,
        })
        .from(invoiceLine)
        .where(inArray(invoiceLine.invoiceId, invoiceIds))
    : [];

  const invoiceSummary = new Map<number, { donationAmount: number; topoMapOrder: boolean }>();
  for (const row of lineRows) {
    const current = invoiceSummary.get(row.invoiceId) ?? { donationAmount: 0, topoMapOrder: false };

    if (row.type === "donation") {
      current.donationAmount += Number(row.amount);
    }

    if (row.type === "topo_map") {
      current.topoMapOrder = true;
    }

    invoiceSummary.set(row.invoiceId, current);
  }

  const membershipIds = memberships.map((row) => row.id);
  const children = await db
    .select()
    .from(membershipChild)
    .where(inArray(membershipChild.membershipId, membershipIds))
    .orderBy(asc(membershipChild.id));

  const childrenByMembership = new Map<
    number,
    Array<{ id: number; firstName: string; lastName: string }>
  >();
  for (const child of children) {
    const list = childrenByMembership.get(child.membershipId) ?? [];
    list.push({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
    });
    childrenByMembership.set(child.membershipId, list);
  }

  return memberships.map((row) => ({
    ...row,
    type: row.type as MembershipType,
    status: row.status as "pending" | "paid" | "failed" | "cancelled",
    price: Number(row.price),
    donationAmount: row.invoiceId ? (invoiceSummary.get(row.invoiceId)?.donationAmount ?? 0) : 0,
    topoMapOrder: row.invoiceId
      ? (invoiceSummary.get(row.invoiceId)?.topoMapOrder ?? false)
      : false,
    children: childrenByMembership.get(row.id) ?? [],
  }));
};
