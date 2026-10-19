CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_hash` text NOT NULL,
	`payload_hash` text NOT NULL,
	`product_id` text NOT NULL,
	`product_slug` text NOT NULL,
	`product_title` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`quantity` integer NOT NULL,
	`notes` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`closed_at` integer,
	CONSTRAINT "enquiry_quantity_valid" CHECK("enquiries"."quantity" BETWEEN 1 AND 10),
	CONSTRAINT "enquiry_status_valid" CHECK("enquiries"."status" IN ('new','contacted','closed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_request_hash_unique` ON `enquiries` (`request_hash`);--> statement-breakpoint
CREATE INDEX `enquiry_created_idx` ON `enquiries` (`created_at`);