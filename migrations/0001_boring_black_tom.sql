CREATE TYPE "public"."invoice_line_type" AS ENUM('membership', 'donation', 'topo_map', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_source" AS ENUM('donation', 'membership', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('personal', 'family');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'declined', 'failed', 'refunded');--> statement-breakpoint
ALTER TYPE "public"."payment_type" ADD VALUE 'card' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source" "invoice_source" DEFAULT 'other' NOT NULL,
	"user_id" text,
	"contact_id" integer,
	"season_id" integer,
	"currency" text DEFAULT 'CAD' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoice_line_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invoice_id" integer NOT NULL,
	"type" "invoice_line_type" DEFAULT 'other' NOT NULL,
	"label" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"membership_id" integer,
	"donation_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"type" "membership_type" NOT NULL,
	"status" "membership_status" DEFAULT 'pending' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"second_adult_first_name" text,
	"second_adult_last_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_child" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_child_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"membership_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invoice_id" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paymentType" "payment_type" DEFAULT 'other' NOT NULL,
	"provider" text,
	"provider_payment_id" text,
	"provider_session_id" text,
	"provider_checkout_url" text,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" date,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_contact_id_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_membership_id_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line" ADD CONSTRAINT "invoice_line_donation_id_donation_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_child" ADD CONSTRAINT "membership_child_membership_id_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_user_id_idx" ON "invoice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoice_contact_id_idx" ON "invoice" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "invoice_season_id_idx" ON "invoice" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_line_invoice_id_idx" ON "invoice_line" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_line_type_idx" ON "invoice_line" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_line_membership_unique" ON "invoice_line" USING btree ("membership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_line_donation_unique" ON "invoice_line" USING btree ("donation_id");--> statement-breakpoint
CREATE INDEX "membership_user_id_idx" ON "membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_status_idx" ON "membership" USING btree ("status");--> statement-breakpoint
CREATE INDEX "membership_child_membership_id_idx" ON "membership_child" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "payment_invoice_id_idx" ON "payment" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_provider_session_id_idx" ON "payment" USING btree ("provider_session_id");