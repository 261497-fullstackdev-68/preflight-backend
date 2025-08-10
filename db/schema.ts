import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  date,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const acceptedEnum = pgEnum("is_accepted", ["True", "False", "Pending"]);

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: date("created_at").defaultNow(),
});

export const todoTable = pgTable("todo", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isDone: boolean("is_done").default(false),
  startDate: date("start_date"),
  imagePath: varchar("image_path", { length: 255 }),
  endDate: date("end_date"),
});

export const shareTodoTable = pgTable("share_todo", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => todoTable.id, { onDelete: "cascade" }),
  shareWith: integer("share_with")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  createdAt: date("created_at").defaultNow(),
  isAccepted: acceptedEnum("is_accepted").default("Pending"),
});
