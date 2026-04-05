import { db } from "@/db/drizzle";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import * as schema from "@/db/schema";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendMagicLinkEmail } from "./email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, ctx) => {
        await sendMagicLinkEmail({ email, url });
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
