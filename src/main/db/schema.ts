import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Placeholder table used to verify the database layer; replaced when projects/tasks land. */
export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
