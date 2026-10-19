CREATE TABLE `community_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`request_hash` text NOT NULL,
	`payload_hash` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`consent` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "community_kind_valid" CHECK(kind IN ('story','hunt','question')),
	CONSTRAINT "community_status_valid" CHECK(status IN ('new','published','closed')),
	CONSTRAINT "community_publish_consent" CHECK(status != 'published' OR (kind = 'story' AND consent = 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_submissions_request_hash_unique` ON `community_submissions` (`request_hash`);--> statement-breakpoint
CREATE INDEX `community_status_idx` ON `community_submissions` (`status`,`created_at`);