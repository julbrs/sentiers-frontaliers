CREATE TYPE "public"."membership_status" AS ENUM('pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('personal', 'family');--> statement-breakpoint
CREATE TABLE "membership" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"type" "membership_type" NOT NULL,
	"status" "membership_status" DEFAULT 'pending' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"donation_amount" numeric(10, 2) DEFAULT '0',
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"second_adult_first_name" text,
	"second_adult_last_name" text,
	"topo_map_order" boolean DEFAULT false NOT NULL,
	"clover_checkout_id" text,
	"clover_checkout_url" text,
	"paid_at" timestamp,
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
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_child" ADD CONSTRAINT "membership_child_membership_id_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "membership_user_id_idx" ON "membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_status_idx" ON "membership" USING btree ("status");--> statement-breakpoint
CREATE INDEX "membership_child_membership_id_idx" ON "membership_child" USING btree ("membership_id");