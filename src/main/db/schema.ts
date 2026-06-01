import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Placeholder table for future app settings (e.g. last selected project). */
export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  identifier: text('identifier').notNull().unique(),
  description: text('description').notNull(),
  color: text('color').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
