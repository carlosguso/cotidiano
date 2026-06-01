import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseClient, runMigrations } from '../client';
import { createProject, deleteProject } from './projects';
import {
  createTask,
  deleteTask,
  deleteTasksForProject,
  importTasks,
  listTasks,
  updateTask,
} from './tasks';

describe('tasks repository', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function setupDb() {
    tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-tasks-'));
    const dbPath = join(tempDir, 'cotidiano.db');
    const { db, sqlite } = createDatabaseClient(dbPath);
    runMigrations(db);
    const project = createProject(db, { name: 'Test', identifier: 'TST' });
    return { db, sqlite, project };
  }

  it('creates, lists, updates, imports, and deletes tasks', () => {
    const { db, sqlite, project } = setupDb();

    const created = createTask(db, {
      projectId: project.id,
      title: 'Design homepage',
      description: 'Wireframe hero',
      status: 'in_progress',
      tags: ['  design  ', 'Design'],
    });

    expect(created.tags).toEqual(['design']);
    expect(listTasks(db)).toHaveLength(1);

    const updated = updateTask(db, created.id, {
      title: 'Updated task',
      status: 'done',
      tags: [],
    });

    expect(updated).toMatchObject({
      title: 'Updated task',
      status: 'done',
      tags: [],
    });

    const imported = importTasks(db, project.id, [
      { title: 'Task A', tags: ['alpha'] },
      { title: 'Task B', status: 'done' },
    ]);

    expect(imported).toHaveLength(2);
    expect(listTasks(db)).toHaveLength(3);

    deleteTask(db, created.id);
    expect(listTasks(db)).toHaveLength(2);

    deleteTasksForProject(db, project.id);
    expect(listTasks(db)).toHaveLength(0);

    sqlite.close();
  });

  it('deletes tasks when a project is removed', () => {
    const { db, sqlite, project } = setupDb();

    createTask(db, { projectId: project.id, title: 'Task 1' });
    expect(listTasks(db)).toHaveLength(1);

    deleteProject(db, project.id);

    expect(listTasks(db)).toHaveLength(0);

    sqlite.close();
  });
});
