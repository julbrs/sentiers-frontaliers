"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { contact } from "@/db/schema";
import { checkAdmin } from "@/lib/auth-server";

export type ContactInput = {
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type Contact = ContactInput & {
  id: number;
};

export const getAllContacts = async () => {
  await checkAdmin();
  const data = await db
    .select()
    .from(contact)
    .orderBy(asc(contact.lastName), asc(contact.firstName));
  return data as Contact[];
};

export const createContact = async (input: ContactInput) => {
  await checkAdmin();
  const [created] = await db
    .insert(contact)
    .values({
      ...input,
    })
    .returning();

  revalidatePath("/admin/contact");
  return created as Contact;
};

export const updateContact = async (id: number, input: Partial<ContactInput>) => {
  await checkAdmin();
  const [updated] = await db.update(contact).set(input).where(eq(contact.id, id)).returning();

  revalidatePath("/admin/contact");
  return updated as Contact;
};

export const deleteContact = async (id: number) => {
  await checkAdmin();
  await db.delete(contact).where(eq(contact.id, id));

  revalidatePath("/admin/contact");
};
