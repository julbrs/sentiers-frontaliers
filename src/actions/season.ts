"use server";
import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { season } from "@/db/schema";
import { checkAdmin } from "@/lib/auth-server";

export const getData = async () => {
  await checkAdmin();
  const data = await db.select().from(season);
  return data;
};

export const addSeason = async (name: string, startDate: Date, endDate: Date) => {
  await checkAdmin();
  await db.insert(season).values({
    name,
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  });

  revalidatePath("/admin");
};

export const getSeasonById = async (id: number) => {
  await checkAdmin();
  const data = await db.select().from(season).where(eq(season.id, id)).limit(1);
  return data[0];
};

export const deleteSeason = async (id: number) => {
  await checkAdmin();
  await db.delete(season).where(eq(season.id, id));

  revalidatePath("/admin");
};

export const editSeason = async (id: number, name: string, startDate: Date, endDate: Date) => {
  await checkAdmin();
  await db
    .update(season)
    .set({
      name,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    })
    .where(eq(season.id, id));

  revalidatePath("/admin");
};
