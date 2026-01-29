"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { checkAdmin } from "@/lib/auth-server";

export type UserInput = {
  name: string;
  email: string;
  role: "user" | "admin";
};

export type User = UserInput & {
  id: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getAllUsers = async () => {
  await checkAdmin();
  const data = await db.select().from(user).orderBy(asc(user.email), asc(user.role));
  return data as User[];
};

export const createUser = async (input: UserInput) => {
  await checkAdmin();
  const id = crypto.randomUUID();
  const [created] = await db
    .insert(user)
    .values({
      id,
      ...input,
    })
    .returning();

  revalidatePath("/admin/user");
  return created as User;
};

export const updateUser = async (id: string, input: Partial<UserInput>) => {
  await checkAdmin();
  const [updated] = await db.update(user).set(input).where(eq(user.id, id)).returning();

  revalidatePath("/admin/user");
  return updated as User;
};

export const deleteUser = async (id: string) => {
  await checkAdmin();
  await db.delete(user).where(eq(user.id, id));

  revalidatePath("/admin/user");
};

export type ParentInput = Omit<UserInput, "role">;
