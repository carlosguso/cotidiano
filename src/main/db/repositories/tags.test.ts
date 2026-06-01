import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseClient, runMigrations } from '../client';
import { createProject } from './projects';
import { createTask } from './tasks';
import { getTagNamesByTaskIds, listTagNamesForProject, resolveTagIds } from './tags';

describe('tags repository', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function setupDb() {
    tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-tags-'));
    const dbPath = join(tempDir, 'cotidiano.db');
    const { db, sqlite } = createDatabaseClient(dbPath);
    runMigrations(db);
    const project = createProject(db, { name: 'Test', identifier: 'TST' });
    return { db, sqlite, project };
  }

  it('deduplicates tags case-insensitively per project', () => {
    const { db, sqlite, project } = setupDb();

    const idsA = resolveTagIds(db, project.id, ['Design', 'design']);
    const idsB = resolveTagIds(db, project.id, ['DESIGN']);

    expect(idsA).toHaveLength(1);
    expect(idsB).toHaveLength(1);
    expect(idsA[0]).toBe(idsB[0]);
    expect(listTagNamesForProject(db, project.id)).toEqual(['Design']);

    createTask(db, {
      projectId: project.id,
      title: 'Task 1',
      tags: ['copy', 'urgent'],
    });
    createTask(db, {
      projectId: project.id,
      title: 'Task 2',
      tags: ['Copy'],
    });

    expect(listTagNamesForProject(db, project.id)).toEqual(
      expect.arrayContaining(['copy', 'Design', 'urgent']),
    );
    expect(listTagNamesForProject(db, project.id)).toHaveLength(3);

    sqlite.close();
  });

  it('getTagNamesByTaskIds returns only tags for the requested tasks', () => {
    const { db, sqlite, project } = setupDb();

    const taskA = createTask(db, {
      projectId: project.id,
      title: 'Task A',
      tags: ['alpha', 'shared'],
    });
    const taskB = createTask(db, {
      projectId: project.id,
      title: 'Task B',
      tags: ['beta'],
    });
    const taskC = createTask(db, {
      projectId: project.id,
      title: 'Task C',
      tags: ['gamma'],
    });

    const byTaskId = getTagNamesByTaskIds(db, [taskA.id, taskB.id]);

    expect(byTaskId.get(taskA.id)?.toSorted()).toEqual(['alpha', 'shared']);
    expect(byTaskId.get(taskB.id)).toEqual(['beta']);
    expect(byTaskId.has(taskC.id)).toBe(false);

    sqlite.close();
  });
});
