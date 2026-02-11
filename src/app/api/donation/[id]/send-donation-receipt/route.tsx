import { db } from "@/db/drizzle";
import { donation, contact, season, donationReceipt } from "@/db/schema";
import { eq } from "drizzle-orm";
import TaxReceiptEmail from "@/emails/donation-receipt";
import { render } from "@react-email/components";
import { SES } from "@aws-sdk/client-ses";
import { createMimeMessage } from "mimetext";
import ReactPDF from "@react-pdf/renderer";
import { DonationReceiptPdf } from "@/components/donation/donation-receipt";
import { checkAdmin } from "@/lib/auth-server";
import fs from "fs";

const ses = new SES();

type ReceiptStatus = "sent" | "failed" | "pending";

const loadLogoDataUri = (): string | undefined => {
  try {
    const logoPath = `${process.cwd()}/public/logo.png`;
    const b64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${b64}`;
  } catch {
    return undefined;
  }
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  await checkAdmin();
  const { id } = await props.params;
  const donationId = Number(id);

  if (Number.isNaN(donationId)) {
    return jsonResponse({ error: "Identifiant de don invalide" }, 400);
  }

  const rows = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      paymentType: donation.paymentType,
      date: donation.date,
      notes: donation.notes,
      seasonName: season.name,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      contactEmail: contact.email,
      contactAddress: contact.address,
    })
    .from(donation)
    .innerJoin(contact, eq(donation.donatorId, contact.id))
    .innerJoin(season, eq(donation.seasonId, season.id))
    .where(eq(donation.id, donationId))
    .limit(1);

  if (rows.length === 0) {
    return jsonResponse({ error: "Don introuvable" }, 404);
  }

  const record = rows[0];
  const amountNumber = Number(record.amount);

  if (!record.contactEmail) {
    return jsonResponse({ error: "Adresse email manquante pour ce contact" }, 400);
  }

  const upsertReceiptStatus = async (
    status: ReceiptStatus,
    errorMessage?: string | null,
  ): Promise<void> => {
    const now = new Date();
    const existing = await db
      .select({ id: donationReceipt.id })
      .from(donationReceipt)
      .where(eq(donationReceipt.donationId, donationId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(donationReceipt)
        .set({
          status,
          sentAt: status === "sent" ? now : null,
          errorMessage: status === "failed" ? (errorMessage ?? null) : null,
          updatedAt: now,
        })
        .where(eq(donationReceipt.id, existing[0].id));
    } else {
      await db.insert(donationReceipt).values({
        donationId,
        status,
        sentAt: status === "sent" ? now : null,
        errorMessage: status === "failed" ? (errorMessage ?? null) : null,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  await upsertReceiptStatus("pending");

  let html: string;
  try {
    html = await render(<TaxReceiptEmail seasonName={record.seasonName} />);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await upsertReceiptStatus("failed", message);
    return jsonResponse({ error: `Génération de l'email impossible: ${message}` }, 500);
  }

  let pdfBase64: string;
  try {
    const logoDataUri = loadLogoDataUri();
    const stream = await ReactPDF.renderToStream(
      <DonationReceiptPdf
        donorFirstName={record.contactFirstName}
        donorLastName={record.contactLastName}
        address={record.contactAddress}
        amount={amountNumber}
        date={record.date}
        seasonName={record.seasonName}
        donationId={donationId}
        logoDataUri={logoDataUri}
      />,
    );

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    pdfBase64 = Buffer.concat(chunks).toString("base64");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await upsertReceiptStatus("failed", message);
    return jsonResponse({ error: `Génération du PDF impossible: ${message}` }, 500);
  }

  const msg = createMimeMessage();
  msg.setSender("Finances Sentiers Frontaliers <finances@sentiersfrontaliers.com>");
  msg.setTo(record.contactEmail);
  msg.setCc("Finances Sentiers Frontaliers <finances@sentiersfrontaliers.com>");
  msg.setSubject(
    `[Sentiers Frontaliers] Reçu de don ${record.seasonName} pour ${record.contactFirstName} ${record.contactLastName}`,
  );
  msg.addMessage({ contentType: "text/html", data: html });
  msg.addAttachment({
    filename: `recu_don_${donationId}.pdf`,
    contentType: "application/pdf",
    data: pdfBase64,
  });

  try {
    const result = await ses.sendRawEmail({ RawMessage: { Data: Buffer.from(msg.asRaw()) } });
    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error(`Statut ${result.$metadata.httpStatusCode}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await upsertReceiptStatus("failed", message);
    return jsonResponse({ error: `Envoi du reçu impossible: ${message}` }, 500);
  }

  await upsertReceiptStatus("sent");

  return jsonResponse({ success: true });
}
