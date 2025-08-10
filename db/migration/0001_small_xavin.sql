ALTER TABLE "share_todo" ALTER COLUMN "created_at" SET DATA TYPE timestamp (2) with time zone;--> statement-breakpoint
ALTER TABLE "share_todo" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todo" ALTER COLUMN "start_date" SET DATA TYPE timestamp (2) with time zone;--> statement-breakpoint
ALTER TABLE "todo" ALTER COLUMN "end_date" SET DATA TYPE timestamp (2) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp (2) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();