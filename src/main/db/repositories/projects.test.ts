import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseClient, runMigrations } from '../client';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from './projects';

describe('projects repository', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function setupDb() {
    tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-projects-'));
    const dbPath = join(tempDir, 'cotidiano.db');
    const { db, sqlite } = createDatabaseClient(dbPath);
    runMigrations(db);
    return { db, sqlite };
  }

  it('creates, lists, updates, and deletes a project', () => {
    const { db, sqlite } = setupDb();

    const created = createProject(db, {
      name: 'Marketing Site',
      identifier: 'mkt',
      description: 'Website refresh',
      color: 'green',
    });

    expect(created).toMatchObject({
      name: 'Marketing Site',
      identifier: 'MKT',
      description: 'Website refresh',
      color: 'green',
      status: 'active',
    });

    expect(listProjects(db)).toHaveLength(1);

    const updated = updateProject(db, created.id, {
      name: 'Updated Name',
      identifier: 'upd',
      status: 'archived',
    });

    expect(updated).toMatchObject({
      name: 'Updated Name',
      identifier: 'UPD',
      status: 'archived',
    });
    expect(updated.updatedAt).not.toBe(created.updatedAt);

    deleteProject(db, created.id);
    expect(listProjects(db)).toHaveLength(0);

    sqlite.close();
  });

  it('throws when updating a missing project', () => {
    const { db, sqlite } = setupDb();

    expect(() => updateProject(db, 'missing-id', { name: 'Nope' })).toThrow(
      'Project not found: missing-id',
    );

    sqlite.close();
  });

  it('throws when deleting a missing project', () => {
    const { db, sqlite } = setupDb();

    expect(() => deleteProject(db, 'missing-id')).toThrow('Project not found: missing-id');

    sqlite.close();
  });
});
