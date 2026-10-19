CREATE TABLE `email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`dedupe_key` text NOT NULL,
	`kind` text NOT NULL,
	`reference_id` text NOT NULL,
	`recipient` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`next_attempt_at` integer NOT NULL,
	`first_attempt_at` integer,
	`provider_id` text,
	`last_error` text,
	`lease_token` text,
	`lease_expires_at` integer,
	CONSTRAINT "email_outbox_status_valid" CHECK(status IN ('pending','sending','accepted','review')),
	CONSTRAINT "email_outbox_attempts_valid" CHECK(attempts >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_outbox_dedupe_key_unique` ON `email_outbox` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `email_outbox_due_idx` ON `email_outbox` (`status`,`next_attempt_at`);