import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  date,
  pgEnum,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// ENUM สำหรับ is_accepted
export const acceptedEnum = pgEnum("is_accepted", ["True", "False", "Pending"]);

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 2,
  }).defaultNow(),
});

export const todoTable = pgTable("todo", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isDone: boolean("is_done").default(false),
  startDate: timestamp("start_date", { withTimezone: true, precision: 2 }),
  imagePath: varchar("image_path", { length: 255 }),
  endDate: timestamp("end_date", { withTimezone: true, precision: 2 }),
});

export const shareTodoTable = pgTable("share_todo", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => todoTable.id, { onDelete: "cascade" }),
  shareWith: integer("share_with")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 2,
  }).defaultNow(),
  isAccepted: acceptedEnum("is_accepted").default("Pending"),
});
