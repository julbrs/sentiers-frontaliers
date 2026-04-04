import ReactPDF from "@react-pdf/renderer";

import { SalesSummaryPdf } from "@/components/admin/sales-summary-pdf";
import { checkAdmin } from "@/lib/auth-server";
import { buildCloverSalesSummary, salesSummaryInputSchema } from "@/lib/sales-summary";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request: Request) {
  try {
    await checkAdmin();
  } catch {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Requête invalide" }, 400);
  }

  const parsed = salesSummaryInputSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.issues[0]?.message ?? "Données invalides" }, 400);
  }

  const summary = await buildCloverSalesSummary(parsed.data);

  let pdfBuffer: Buffer;
  try {
    const stream = await ReactPDF.renderToStream(<SalesSummaryPdf summary={summary} />);
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    pdfBuffer = Buffer.concat(chunks);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: `Génération du PDF impossible: ${message}` }, 500);
  }

  const fileName = `resume_ventes_clover_${summary.startDate}_${summary.endDate}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
