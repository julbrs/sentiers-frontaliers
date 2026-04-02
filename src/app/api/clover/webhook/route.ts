import fs from "fs";
import React from "react";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { SES } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import ReactPDF from "@react-pdf/renderer";
import { createMimeMessage } from "mimetext";
import { asc, eq } from "drizzle-orm";
import MembershipCardEmail from "@/emails/membership-card";
import OrderNotificationEmail from "@/emails/order-notification";
import { MembershipCardPdf } from "@/components/membership/membership-card";
import { db } from "@/db/drizzle";
import { invoice, invoiceLine, membership, membershipChild, payment } from "@/db/schema";
import { TOPO_MAP_PRICE } from "@/constants";

const ses = new SES();

// Clover webhook payload for Hosted Checkout
// Type: PAYMENT, Status: APPROVED | DECLINED
// Data field contains the checkout session UUID
interface CloverWebhookPayload {
  type: string;
  status: string;
  id: string;
  merchantId: string;
  created: number;
  message: string;
  checkoutSessionId: string;
}

const loadLogoDataUri = (): string | undefined => {
  try {
    const logoPath = `${process.cwd()}/public/membre.png`;
    const b64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${b64}`;
  } catch {
    return undefined;
  }
};

const sendMembershipCardEmail = async (params: {
  email: string;
  firstName: string;
  lastName: string;
  membershipId: number;
  membershipType: "personal" | "family";
  paidAt: Date;
  secondAdultFirstName: string | null;
  secondAdultLastName: string | null;
  children: Array<{ firstName: string; lastName: string }>;
}) => {
  const html = await render(
    React.createElement(MembershipCardEmail, {
      firstName: params.firstName,
      lastName: params.lastName,
      membershipType: params.membershipType,
      paidAt: params.paidAt,
    }),
  );

  const logoDataUri = loadLogoDataUri();
  // eslint-disable-next-line react/no-children-prop
  const cardDocument = React.createElement(MembershipCardPdf, {
    firstName: params.firstName,
    lastName: params.lastName,
    type: params.membershipType,
    paidAt: params.paidAt,
    secondAdultFirstName: params.secondAdultFirstName,
    secondAdultLastName: params.secondAdultLastName,
    children: params.children,
    membershipId: params.membershipId,
    logoDataUri,
  }) as unknown as Parameters<typeof ReactPDF.renderToStream>[0];

  const stream = await ReactPDF.renderToStream(cardDocument);

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  const pdfBase64 = Buffer.concat(chunks).toString("base64");
  const membershipNo = String(params.membershipId).padStart(6, "0");

  const msg = createMimeMessage();
  msg.setSender("Sentiers Frontaliers <finances@sentiersfrontaliers.com>");
  msg.setTo(params.email);
  msg.setSubject(
    `[Sentiers Frontaliers] Carte de membre #${membershipNo} - ${params.firstName} ${params.lastName}`,
  );
  msg.addMessage({ contentType: "text/html", data: html });
  msg.addAttachment({
    filename: `carte_membre_${membershipNo}.pdf`,
    contentType: "application/pdf",
    data: pdfBase64,
  });

  const result = await ses.sendRawEmail({ RawMessage: { Data: Buffer.from(msg.asRaw()) } });
  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(`Email send failed with status ${result.$metadata.httpStatusCode}`);
  }
};

const sendOrderNotificationEmail = async (params: {
  membershipNo: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  membershipType: "personal" | "family";
  membershipPrice: number;
  donationAmount: number;
  topoMapOrder: boolean;
  paidAt: Date;
}) => {
  const html = await render(
    React.createElement(OrderNotificationEmail, {
      membershipNo: params.membershipNo,
      firstName: params.firstName,
      lastName: params.lastName,
      address: params.address,
      phone: params.phone,
      email: params.email,
      membershipType: params.membershipType,
      membershipPrice: params.membershipPrice,
      donationAmount: params.donationAmount,
      topoMapOrder: params.topoMapOrder,
      topoMapPrice: TOPO_MAP_PRICE,
      paidAt: params.paidAt,
    }),
  );

  const result = await ses.sendEmail({
    Source: "Sentiers Frontaliers <finances@sentiersfrontaliers.com>",
    Destination: { ToAddresses: ["finances@sentiersfrontaliers.com"] },
    Message: {
      Subject: {
        Data: `[Adhésion] Nouvelle commande #${params.membershipNo} - ${params.firstName} ${params.lastName}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
      },
    },
  });

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error(
      `Order notification email failed with status ${result.$metadata.httpStatusCode}`,
    );
  }
};

function verifyCloverSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  // Format: t=<timestamp>,v1=<hmac>
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=") as [string, string]),
  );

  const timestamp = parts["t"];
  const receivedHmac = parts["v1"];

  if (!timestamp || !receivedHmac) {
    return false;
  }

  // Reject if event is more than 5 minutes old (replay protection)
  const eventTime = parseInt(timestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - eventTime) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedHmac = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac));
  } catch {
    // Buffers differ in length → invalid
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signingSecret = process.env.CLOVER_WEBHOOK_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("Clover-Signature");

  console.log("[clover/webhook] Received POST");
  console.log("[clover/webhook] Clover-Signature header:", signatureHeader ?? "(none)");
  console.log("[clover/webhook] Raw body:", rawBody);

  if (!signingSecret) {
    if (isDev) {
      console.warn(
        "[clover/webhook] CLOVER_WEBHOOK_SECRET is not set — skipping signature check in development",
      );
    } else {
      console.error("[clover/webhook] CLOVER_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
  } else {
    if (!verifyCloverSignature(rawBody, signatureHeader, signingSecret)) {
      console.warn("[clover/webhook] Signature validation failed");
      console.warn("[clover/webhook] Header received:", signatureHeader);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    console.log("[clover/webhook] Signature valid");
  }

  let payload: CloverWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as CloverWebhookPayload;
  } catch (err) {
    console.error("[clover/webhook] JSON parse failed:", err);
    console.error("[clover/webhook] Body that failed to parse:", rawBody);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[clover/webhook] Parsed payload:", JSON.stringify(payload));

  // Only handle PAYMENT events
  if (payload.type !== "PAYMENT") {
    console.log(`[clover/webhook] Ignoring non-PAYMENT event type: ${payload.type}`);
    return NextResponse.json({ received: true });
  }

  const checkoutSessionId = payload.checkoutSessionId;

  if (!checkoutSessionId) {
    console.error("[clover/webhook] Missing checkoutSessionId in payload:", payload);
    return NextResponse.json({ error: "Missing checkout session ID" }, { status: 400 });
  }

  console.log(
    `[clover/webhook] Processing ${payload.status} for checkout session ${checkoutSessionId}`,
  );

  if (payload.status === "APPROVED") {
    const paymentRows = await db
      .select({
        id: payment.id,
        invoiceId: payment.invoiceId,
      })
      .from(payment)
      .where(eq(payment.providerSessionId, checkoutSessionId))
      .limit(1);

    if (paymentRows.length === 0) {
      console.warn(`[clover/webhook] No payment found for checkout session ${checkoutSessionId}`);
      return NextResponse.json({ received: true });
    }

    const paymentRecord = paymentRows[0];
    const paidAt = new Date();

    await db
      .update(invoice)
      .set({
        status: "paid",
        paidAt,
      })
      .where(eq(invoice.id, paymentRecord.invoiceId));

    const paymentDate = new Date().toISOString().slice(0, 10);
    await db
      .update(payment)
      .set({
        status: "approved",
        paymentType: "card",
        provider: "clover",
        providerPaymentId: payload.id,
        providerSessionId: checkoutSessionId,
        paymentDate,
        paidAt,
      })
      .where(eq(payment.id, paymentRecord.id));

    const rows = await db
      .select({
        invoiceId: invoice.id,
        id: membership.id,
        status: membership.status,
        type: membership.type,
        firstName: membership.firstName,
        lastName: membership.lastName,
        address: membership.address,
        phone: membership.phone,
        secondAdultFirstName: membership.secondAdultFirstName,
        secondAdultLastName: membership.secondAdultLastName,
        email: membership.email,
        price: membership.price,
      })
      .from(invoice)
      .innerJoin(invoiceLine, eq(invoiceLine.invoiceId, invoice.id))
      .innerJoin(membership, eq(membership.id, invoiceLine.membershipId))
      .where(eq(invoice.id, paymentRecord.invoiceId))
      .limit(1);

    if (rows.length === 0) {
      console.log(
        `[clover/webhook] Invoice ${paymentRecord.invoiceId} paid without membership line (likely donation-only)`,
      );
      return NextResponse.json({ received: true });
    }

    const membershipRecord = rows[0];

    await db
      .update(membership)
      .set({
        status: "paid",
      })
      .where(eq(membership.id, membershipRecord.id));

    const lineRows = await db
      .select({
        type: invoiceLine.type,
        amount: invoiceLine.amount,
      })
      .from(invoiceLine)
      .where(eq(invoiceLine.invoiceId, membershipRecord.invoiceId));

    const membershipLineAmount =
      lineRows.find((line) => line.type === "membership")?.amount ?? membershipRecord.price;
    const donationLineAmount = lineRows.find((line) => line.type === "donation")?.amount ?? "0";
    const hasTopoMapLine = lineRows.some((line) => line.type === "topo_map");

    const children = await db
      .select({
        firstName: membershipChild.firstName,
        lastName: membershipChild.lastName,
      })
      .from(membershipChild)
      .where(eq(membershipChild.membershipId, membershipRecord.id))
      .orderBy(asc(membershipChild.id));

    try {
      await sendMembershipCardEmail({
        email: membershipRecord.email,
        firstName: membershipRecord.firstName,
        lastName: membershipRecord.lastName,
        membershipId: membershipRecord.id,
        membershipType: membershipRecord.type,
        paidAt,
        secondAdultFirstName: membershipRecord.secondAdultFirstName,
        secondAdultLastName: membershipRecord.secondAdultLastName,
        children,
      });
      console.log(
        `[clover/webhook] Membership card email sent for checkout session ${checkoutSessionId}`,
      );
    } catch (error) {
      console.error(
        `[clover/webhook] Failed to send membership card email for checkout session ${checkoutSessionId}`,
        error,
      );
      return NextResponse.json({ error: "Failed to send membership card email" }, { status: 500 });
    }

    try {
      const membershipNo = String(membershipRecord.id).padStart(6, "0");
      await sendOrderNotificationEmail({
        membershipNo,
        firstName: membershipRecord.firstName,
        lastName: membershipRecord.lastName,
        address: membershipRecord.address,
        phone: membershipRecord.phone,
        email: membershipRecord.email,
        membershipType: membershipRecord.type,
        membershipPrice: Number(membershipLineAmount),
        donationAmount: Number(donationLineAmount),
        topoMapOrder: hasTopoMapLine,
        paidAt,
      });
      console.log(
        `[clover/webhook] Order notification email sent for checkout session ${checkoutSessionId}`,
      );
    } catch (error) {
      console.error(
        `[clover/webhook] Failed to send order notification email for checkout session ${checkoutSessionId}`,
        error,
      );
      // Non-blocking: log error but don't fail the webhook
    }

    console.log(
      `[clover/webhook] Membership marked as paid for checkout session ${checkoutSessionId}`,
    );
  } else if (payload.status === "DECLINED") {
    const paymentRows = await db
      .select({
        id: payment.id,
        invoiceId: payment.invoiceId,
      })
      .from(payment)
      .where(eq(payment.providerSessionId, checkoutSessionId))
      .limit(1);

    if (paymentRows.length === 0) {
      console.warn(`[clover/webhook] No payment found for checkout session ${checkoutSessionId}`);
      return NextResponse.json({ received: true });
    }

    const paymentRecord = paymentRows[0];

    await db
      .update(invoice)
      .set({ status: "failed" })
      .where(eq(invoice.id, paymentRecord.invoiceId));

    await db
      .update(payment)
      .set({
        status: "declined",
        provider: "clover",
        providerPaymentId: payload.id,
        providerSessionId: checkoutSessionId,
      })
      .where(eq(payment.id, paymentRecord.id));

    const membershipRows = await db
      .select({
        membershipId: membership.id,
      })
      .from(invoiceLine)
      .innerJoin(membership, eq(membership.id, invoiceLine.membershipId))
      .where(eq(invoiceLine.invoiceId, paymentRecord.invoiceId))
      .limit(1);

    if (membershipRows[0]) {
      await db
        .update(membership)
        .set({ status: "failed" })
        .where(eq(membership.id, membershipRows[0].membershipId));
    }

    console.log(
      `[clover/webhook] Membership marked as failed for checkout session ${checkoutSessionId}`,
    );
  } else {
    console.log(`[clover/webhook] Unhandled status: ${payload.status}`);
  }

  return NextResponse.json({ received: true });
}
