"use server";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { membership, membershipChild } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";

const PRICE_BY_TYPE = {
  personal: 42,
  family: 65,
} as const;

const childSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom de l'enfant est requis"),
  lastName: z.string().trim().min(1, "Le nom de l'enfant est requis"),
});

const membershipInputSchema = z
  .object({
    type: z.enum(["personal", "family"]),
    firstName: z.string().trim().min(1, "Le prenom est requis"),
    lastName: z.string().trim().min(1, "Le nom est requis"),
    address: z.string().trim().min(1, "L'adresse est requise"),
    phone: z.string().trim().min(1, "Le telephone est requis"),
    email: z.string().trim().email("Adresse email invalide"),
    donationAmount: z.number().optional().default(0),
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
        message: "Au moins un enfant est requis pour une adhesion familiale",
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
      name: params.membershipType === "family" ? "Adhesion familiale" : "Adhesion personnelle",
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

  const [createdMembership] = await db
    .insert(membership)
    .values({
      userId: session.user.id,
      type: parsed.type,
      status: "pending",
      price: amount.toFixed(2),
      donationAmount: donationAmount.toFixed(2),
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
    });

    await db
      .update(membership)
      .set({
        cloverCheckoutId: checkout.checkoutSessionId,
        cloverCheckoutUrl: checkout.href,
      })
      .where(eq(membership.id, createdMembership.id));

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
    .from(membership)
    .where(eq(membership.cloverCheckoutId, checkoutSessionId))
    .limit(1);

  if (!membershipToDelete.length) {
    return { deleted: false, reason: "Membership not found" };
  }

  const m = membershipToDelete[0];

  if (m.userId !== session.user.id) {
    return { deleted: false, reason: "Unauthorized" };
  }

  if (m.status !== "pending") {
    return { deleted: false, reason: "Membership is not pending" };
  }

  // Delete associated children first
  if (m.type === "family") {
    await db.delete(membershipChild).where(eq(membershipChild.membershipId, m.id));
  }

  // Delete the membership
  await db.delete(membership).where(eq(membership.id, m.id));

  revalidatePath("/profile");
  return { deleted: true };
};

export const getMyMemberships = async (): Promise<MembershipWithChildren[]> => {
  const session = await requireSession();

  const memberships = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, session.user.id))
    .orderBy(desc(membership.createdAt), asc(membership.id));

  if (!memberships.length) {
    return [];
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
    donationAmount: row.donationAmount ? Number(row.donationAmount) : null,
    children: childrenByMembership.get(row.id) ?? [],
  }));
};
