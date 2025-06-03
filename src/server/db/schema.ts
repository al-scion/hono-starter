import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';

export const users = pgTable("users", {
    id: integer().primaryKey(),
    name: text().notNull(),
    age: integer().notNull(),
    email: text().notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
