import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseClient, pingDatabase, runMigrations } from './client';
import { appMeta } from './schema';

describe('database client', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('connects to sqlite, runs migrations, and answers ping', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-db-'));
    const dbPath = join(tempDir, 'cotidiano.db');

    const { db, sqlite } = createDatabaseClient(dbPath);
    runMigrations(db);

    expect(pingDatabase(db)).toBe(true);

    const rows = db.select().from(appMeta).all();
    expect(rows).toEqual([]);

    sqlite.close();
  });

  it('connects to an in-memory database', () => {
    const { db, sqlite } = createDatabaseClient(':memory:');
    runMigrations(db);

    expect(pingDatabase(db)).toBe(true);

    sqlite.close();
  });
});
