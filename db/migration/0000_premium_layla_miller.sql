CREATE TYPE "public"."is_accepted" AS ENUM('True', 'False', 'Pending');--> statement-breakpoint
CREATE TABLE "share_todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"share_with" integer NOT NULL,
	"created_at" date DEFAULT now(),
	"is_accepted" "is_accepted" DEFAULT 'Pending'
);
--> statement-breakpoint
CREATE TABLE "todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"is_done" boolean DEFAULT false,
	"start_date" date,
	"image_path" varchar(255),
	"end_date" date
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" date DEFAULT now(),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "share_todo" ADD CONSTRAINT "share_todo_task_id_todo_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."todo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_todo" ADD CONSTRAINT "share_todo_share_with_user_id_fk" FOREIGN KEY ("share_with") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todo" ADD CONSTRAINT "todo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;