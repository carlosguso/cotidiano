import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/main/db/schema.ts',
  out: './src/main/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.COTIDIANO_DB_PATH ?? './data/cotidiano.db',
  },
});
