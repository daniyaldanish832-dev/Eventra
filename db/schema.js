import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: text().notNull().default("Attendee"),
  createdAt: timestamp("created_at").defaultNow(),
});
