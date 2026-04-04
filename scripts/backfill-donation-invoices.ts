import "dotenv/config";

import { asc, eq, isNull } from "drizzle-orm";
import { db } from "../src/db/drizzle";
import { contact, donation, invoice, invoiceLine } from "../src/db/schema";

type DonationToBackfill = {
  id: number;
  amount: string;
  date: string;
  notes: string | null;
  donatorId: number;
  seasonId: number;
  contactFirstName: string;
  contactLastName: string;
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");

function parseDonationDateAsLocalTimestamp(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

async function getMissingDonationInvoices() {
  const rows = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      date: donation.date,
      notes: donation.notes,
      donatorId: donation.donatorId,
      seasonId: donation.seasonId,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
    })
    .from(donation)
    .innerJoin(contact, eq(contact.id, donation.donatorId))
    .leftJoin(invoiceLine, eq(invoiceLine.donationId, donation.id))
    .where(isNull(invoiceLine.id))
    .orderBy(asc(donation.id));

  return rows as DonationToBackfill[];
}

async function backfillDonationInvoice(row: DonationToBackfill) {
  const [createdInvoice] = await db
    .insert(invoice)
    .values({
      source: "donation",
      contactId: row.donatorId,
      seasonId: row.seasonId,
      subtotal: row.amount,
      total: row.amount,
      status: "paid",
      paidAt: parseDonationDateAsLocalTimestamp(row.date),
    })
    .returning({ id: invoice.id });

  try {
    await db.insert(invoiceLine).values({
      invoiceId: createdInvoice.id,
      type: "donation",
      label: `Don (historique) - ${row.contactFirstName} ${row.contactLastName}`,
      quantity: 1,
      unitPrice: row.amount,
      amount: row.amount,
      donationId: row.id,
    });
  } catch (error) {
    // Neon HTTP does not support transactions; remove the invoice to avoid partial backfill.
    await db.delete(invoice).where(eq(invoice.id, createdInvoice.id));
    throw error;
  }
}

async function main() {
  const missing = await getMissingDonationInvoices();

  if (missing.length === 0) {
    console.log("Aucun don a backfiller: tous les dons ont deja une invoice_line liee.");
    return;
  }

  console.log(`Dons sans invoice_line detectes: ${missing.length}`);

  if (dryRun) {
    console.log("Mode dry-run: aucune ecriture en base.");
    missing.slice(0, 20).forEach((row) => {
      console.log(
        `- donation#${row.id}: ${row.amount} CAD, date=${row.date}, contact=${row.contactFirstName} ${row.contactLastName}`,
      );
    });

    if (missing.length > 20) {
      console.log(`... et ${missing.length - 20} autres dons.`);
    }

    return;
  }

  let createdCount = 0;

  for (const row of missing) {
    try {
      await backfillDonationInvoice(row);
      createdCount += 1;
      console.log(`OK donation#${row.id} -> invoice + invoice_line creees`);
    } catch (error) {
      console.error(`ERREUR donation#${row.id}`, error);
    }
  }

  console.log(`Backfill termine. ${createdCount}/${missing.length} dons traites.`);
}

main().catch((error) => {
  console.error("Echec du backfill:", error);
  process.exit(1);
});
