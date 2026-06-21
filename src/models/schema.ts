import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const textTable = pgTable('text', {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
});

export const fileTable = pgTable('files', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    size: integer('size').notNull(),
    type: text('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
});