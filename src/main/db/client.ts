import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type Database from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type AppDatabase = BetterSQLite3Database<typeof schema>;

let database: AppDatabase | null = null;

export function createDatabaseClient(dbPath: string): {
  db: AppDatabase;
  sqlite: Database.Database;
} {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const sqlite = new BetterSqlite3(dbPath);
  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}

export function getMigrationsFolder(): string {
  return join(__dirname, 'migrations');
}

export function runMigrations(db: AppDatabase): void {
  migrate(db, { migrationsFolder: getMigrationsFolder() });
}

export function initDatabase(dbPath: string): AppDatabase {
  const { db } = createDatabaseClient(dbPath);
  runMigrations(db);
  database = db;
  return db;
}

export function getDatabase(): AppDatabase {
  if (!database) {
    throw new Error('Database has not been initialized. Call initDatabase() first.');
  }

  return database;
}

export function closeDatabase(): void {
  database = null;
}

export function pingDatabase(db: AppDatabase): boolean {
  const row = db.get<{ ok: number }>(sql`SELECT 1 AS ok`);
  return row?.ok === 1;
}
