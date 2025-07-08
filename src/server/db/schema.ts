import type { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey(),
  name: text().notNull(),
  age: integer().notNull(),
  email: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
