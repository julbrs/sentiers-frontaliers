import { headers } from "next/headers";
import { auth } from "./auth";

export const checkAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
};
