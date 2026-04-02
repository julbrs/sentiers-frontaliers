import fs from "fs";
import ReactPDF from "@react-pdf/renderer";
import { and, asc, eq } from "drizzle-orm";

import { MembershipCardPdf } from "@/components/membership/membership-card";
import { db } from "@/db/drizzle";
import { invoice, invoiceLine, membership, membershipChild } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const loadLogoDataUri = (): string | undefined => {
  try {
    const logoPath = `${process.cwd()}/public/membre.png`;
    const b64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${b64}`;
  } catch {
    return undefined;
  }
};

const isMembershipActive = (paidAt: Date): boolean => {
  const startDate = new Date(paidAt);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const now = new Date();

  return startDate <= now && now < endDate;
};

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { id } = await props.params;
  const membershipId = Number(id);

  if (Number.isNaN(membershipId)) {
    return jsonResponse({ error: "Identifiant d'adhesion invalide" }, 400);
  }

  const rows = await db
    .select({
      id: membership.id,
      userId: membership.userId,
      type: membership.type,
      status: membership.status,
      firstName: membership.firstName,
      lastName: membership.lastName,
      secondAdultFirstName: membership.secondAdultFirstName,
      secondAdultLastName: membership.secondAdultLastName,
      paidAt: invoice.paidAt,
    })
    .from(membership)
    .leftJoin(invoiceLine, eq(invoiceLine.membershipId, membership.id))
    .leftJoin(invoice, eq(invoice.id, invoiceLine.invoiceId))
    .where(and(eq(membership.id, membershipId), eq(membership.userId, session.user.id)))
    .limit(1);

  if (rows.length === 0) {
    return jsonResponse({ error: "Adhesion introuvable" }, 404);
  }

  const record = rows[0];

  if (record.status !== "paid" || !record.paidAt) {
    return jsonResponse({ error: "Cette adhesion n'est pas active" }, 403);
  }

  if (!isMembershipActive(record.paidAt)) {
    return jsonResponse({ error: "Cette adhesion est expiree" }, 403);
  }

  const children = await db
    .select({
      firstName: membershipChild.firstName,
      lastName: membershipChild.lastName,
    })
    .from(membershipChild)
    .where(eq(membershipChild.membershipId, record.id))
    .orderBy(asc(membershipChild.id));

  let pdfBuffer: Buffer;
  try {
    const logoDataUri = loadLogoDataUri();
    const stream = await ReactPDF.renderToStream(
      <MembershipCardPdf
        firstName={record.firstName}
        lastName={record.lastName}
        type={record.type}
        paidAt={record.paidAt}
        secondAdultFirstName={record.secondAdultFirstName}
        secondAdultLastName={record.secondAdultLastName}
        children={children}
        membershipId={record.id}
        logoDataUri={logoDataUri}
      />,
    );

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    pdfBuffer = Buffer.concat(chunks);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: `Generation du PDF impossible: ${message}` }, 500);
  }

  const fileName = `carte_membre_${String(record.id).padStart(6, "0")}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
