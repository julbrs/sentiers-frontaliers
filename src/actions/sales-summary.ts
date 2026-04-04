"use server";

import { checkAdmin } from "@/lib/auth-server";
import {
  buildCloverSalesSummary,
  salesSummaryInputSchema,
  type CloverSalesSummary,
  type SalesSummaryInput,
} from "@/lib/sales-summary";

export async function getCloverSalesSummary(input: SalesSummaryInput): Promise<CloverSalesSummary> {
  await checkAdmin();
  const parsed = salesSummaryInputSchema.parse(input);
  return buildCloverSalesSummary(parsed);
}
