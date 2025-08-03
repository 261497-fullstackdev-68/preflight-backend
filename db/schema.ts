import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  serial,
  text,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
});