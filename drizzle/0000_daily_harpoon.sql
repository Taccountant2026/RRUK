CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`request_hash` text NOT NULL,
	`basket_hash` text NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`account_id` text NOT NULL,
	`total_pence` integer NOT NULL,
	`shipping_pence` integer NOT NULL,
	`items_json` text NOT NULL,
	`policy_version` text NOT NULL,
	`policy_text` text NOT NULL,
	`session_id` text,
	`checkout_url` text,
	`expires_at` integer NOT NULL,
	`restocked` integer DEFAULT 0 NOT NULL,
	`customer_json` text,
	`tracking` text,
	`carrier` text,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	`dispatched_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_hash_unique` ON `orders` (`request_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_session_id_unique` ON `orders` (`session_id`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `order_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`condition` text NOT NULL,
	`condition_notes` text NOT NULL,
	`price_pence` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`images_json` text DEFAULT '[]' NOT NULL,
	`includes_json` text DEFAULT '[]' NOT NULL,
	`compatibility` text NOT NULL,
	`shipping_pence` integer DEFAULT 0 NOT NULL,
	`delivery_estimate` text NOT NULL,
	`warranty_months` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "stock_nonnegative" CHECK("products"."stock" >= 0),
	CONSTRAINT "price_positive" CHECK("products"."price_pence" >= 50),
	CONSTRAINT "shipping_nonnegative" CHECK("products"."shipping_pence" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`order_id` text,
	`mode` text NOT NULL,
	`received_at` integer NOT NULL
);
