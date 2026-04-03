import { relations } from "drizzle-orm";
import {
  integer,
  text,
  pgTable,
  date,
  pgEnum,
  uniqueIndex,
  decimal,
  timestamp,
  index,
  boolean,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const season = pgTable("season", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

export const contact = pgTable("contact", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
});

export const paymentTypeEnum = pgEnum("payment_type", [
  "cash",
  "check",
  "bank_transfer",
  "card",
  "other",
]);

export const invoiceSourceEnum = pgEnum("invoice_source", ["donation", "membership", "other"]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "pending",
  "paid",
  "failed",
  "cancelled",
]);

export const donation = pgTable("donation", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum().notNull().default("cash"),
  date: date("date").notNull(),
  notes: text("notes"),
  donatorId: integer("donator_id")
    .references(() => contact.id)
    .notNull(),
  seasonId: integer("season_id")
    .references(() => season.id)
    .notNull(),
});

export const donationReceiptStatusEnum = pgEnum("tax_receipt_status", [
  "sent",
  "failed",
  "pending",
]);

export const donationReceipt = pgTable(
  "tax_receipt",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    donationId: integer("donation_id")
      .references(() => donation.id)
      .notNull(),
    status: donationReceiptStatusEnum().notNull().default("pending"),
    sentAt: timestamp("sent_at"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tax_receipt_donation_unique").on(table.donationId)],
);

export const membershipTypeEnum = pgEnum("membership_type", ["personal", "family", "corporate"]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "pending",
  "paid",
  "failed",
  "cancelled",
]);

export const membership = pgTable(
  "membership",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    type: membershipTypeEnum().notNull(),
    status: membershipStatusEnum().notNull().default("pending"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    secondAdultFirstName: text("second_adult_first_name"),
    secondAdultLastName: text("second_adult_last_name"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("membership_user_id_idx").on(table.userId),
    index("membership_status_idx").on(table.status),
  ],
);

export const membershipChild = pgTable(
  "membership_child",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    membershipId: integer("membership_id")
      .references(() => membership.id, { onDelete: "cascade" })
      .notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
  },
  (table) => [index("membership_child_membership_id_idx").on(table.membershipId)],
);

export const invoice = pgTable(
  "invoice",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    source: invoiceSourceEnum().notNull().default("other"),
    userId: text("user_id").references(() => user.id),
    contactId: integer("contact_id").references(() => contact.id),
    seasonId: integer("season_id").references(() => season.id),
    currency: text("currency").notNull().default("CAD"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
    status: invoiceStatusEnum().notNull().default("pending"),
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("invoice_user_id_idx").on(table.userId),
    index("invoice_contact_id_idx").on(table.contactId),
    index("invoice_season_id_idx").on(table.seasonId),
    index("invoice_status_idx").on(table.status),
  ],
);

export const invoiceLineTypeEnum = pgEnum("invoice_line_type", [
  "membership",
  "donation",
  "topo_map",
  "other",
]);

export const invoiceLine = pgTable(
  "invoice_line",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    invoiceId: integer("invoice_id")
      .references(() => invoice.id, { onDelete: "cascade" })
      .notNull(),
    type: invoiceLineTypeEnum().notNull().default("other"),
    label: text("label").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    membershipId: integer("membership_id").references(() => membership.id, {
      onDelete: "set null",
    }),
    donationId: integer("donation_id").references(() => donation.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("invoice_line_invoice_id_idx").on(table.invoiceId),
    index("invoice_line_type_idx").on(table.type),
    uniqueIndex("invoice_line_membership_unique").on(table.membershipId),
    uniqueIndex("invoice_line_donation_unique").on(table.donationId),
  ],
);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "approved",
  "declined",
  "failed",
  "refunded",
]);

export const payment = pgTable(
  "payment",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    invoiceId: integer("invoice_id")
      .references(() => invoice.id, { onDelete: "cascade" })
      .notNull(),
    status: paymentStatusEnum().notNull().default("pending"),
    paymentType: paymentTypeEnum().notNull().default("other"),
    provider: text("provider"),
    providerPaymentId: text("provider_payment_id"),
    providerSessionId: text("provider_session_id"),
    providerCheckoutUrl: text("provider_checkout_url"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    index("payment_invoice_id_idx").on(table.invoiceId),
    index("payment_status_idx").on(table.status),
    index("payment_provider_session_id_idx").on(table.providerSessionId),
  ],
);
