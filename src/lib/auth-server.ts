import { headers } from "next/headers";
import { auth } from "./auth";

export const requireSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
};

export const checkAdmin = async () => {
  const session = await requireSession();

  if (session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
};
