import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { membership } from "@/db/schema";

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
    await db
      .update(membership)
      .set({
        status: "paid",
        paidAt: new Date(),
      })
      .where(eq(membership.cloverCheckoutId, checkoutSessionId));

    console.log(
      `[clover/webhook] Membership marked as paid for checkout session ${checkoutSessionId}`,
    );
  } else if (payload.status === "DECLINED") {
    await db
      .update(membership)
      .set({ status: "failed" })
      .where(eq(membership.cloverCheckoutId, checkoutSessionId));

    console.log(
      `[clover/webhook] Membership marked as failed for checkout session ${checkoutSessionId}`,
    );
  } else {
    console.log(`[clover/webhook] Unhandled status: ${payload.status}`);
  }

  return NextResponse.json({ received: true });
}
