CREATE TABLE `ops_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`uploader_id` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `ops_cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ops_attachments_object_key_unique` ON `ops_attachments` (`object_key`);--> statement-breakpoint
CREATE INDEX `ops_attachment_case_idx` ON `ops_attachments` (`case_id`);--> statement-breakpoint
CREATE TABLE `ops_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`kind` text NOT NULL,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`request_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`preferred_at` text DEFAULT '' NOT NULL,
	`scheduled_at` text DEFAULT '' NOT NULL,
	`service_id` text DEFAULT '' NOT NULL,
	`provider_ref` text DEFAULT '' NOT NULL,
	`provider_url` text DEFAULT '' NOT NULL,
	`quote_pence` integer,
	`quote_status` text DEFAULT 'none' NOT NULL,
	`quote_terms` text DEFAULT '' NOT NULL,
	`quote_reply_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "ops_case_brand" CHECK(brand IN ('rruk','bytova','garden')),
	CONSTRAINT "ops_case_kind" CHECK(kind IN ('enquiry','booking','job','incident','quote','repair')),
	CONSTRAINT "ops_case_status" CHECK(status IN ('new','awaiting_customer','in_progress','scheduled','completed','cancel_requested','cancelled','closed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ops_cases_request_key_unique` ON `ops_cases` (`request_key`);--> statement-breakpoint
CREATE INDEX `ops_case_customer_idx` ON `ops_cases` (`user_id`,`brand`,`updated_at`);--> statement-breakpoint
CREATE INDEX `ops_case_work_idx` ON `ops_cases` (`brand`,`kind`,`status`);--> statement-breakpoint
CREATE TABLE `ops_customers` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ops_events` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `ops_cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ops_event_case_idx` ON `ops_events` (`case_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ops_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_role` text NOT NULL,
	`visibility` text NOT NULL,
	`body` text NOT NULL,
	`request_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `ops_cases`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ops_message_visibility" CHECK(visibility IN ('shared','internal')),
	CONSTRAINT "ops_message_sender" CHECK(sender_role IN ('customer','owner')),
	CONSTRAINT "ops_message_internal" CHECK(visibility != 'internal' OR sender_role = 'owner')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ops_messages_request_key_unique` ON `ops_messages` (`request_key`);--> statement-breakpoint
CREATE INDEX `ops_message_case_idx` ON `ops_messages` (`case_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ops_order_links` (
	`order_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ops_order_customer_idx` ON `ops_order_links` (`user_id`);