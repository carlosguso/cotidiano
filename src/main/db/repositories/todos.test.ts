import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabaseClient, runMigrations } from '../client';
import { createProject } from './projects';
import { createTask, deleteTask } from './tasks';
import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  listTodoItems,
  listTodoLists,
  updateTodoItem,
  updateTodoList,
} from './todos';

describe('todos repository', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function setupDb() {
    tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-todos-'));
    const dbPath = join(tempDir, 'cotidiano.db');
    const { db, sqlite } = createDatabaseClient(dbPath);
    runMigrations(db);
    const project = createProject(db, { name: 'Test', identifier: 'TST' });
    return { db, sqlite, project };
  }

  it('creates, lists, updates, and deletes todo lists', () => {
    const { db, sqlite } = setupDb();

    const created = createTodoList(db, { name: 'Today' });
    expect(created.name).toBe('Today');
    expect(listTodoLists(db)).toHaveLength(1);

    const updated = updateTodoList(db, created.id, { name: 'Tomorrow' });
    expect(updated.name).toBe('Tomorrow');

    deleteTodoList(db, created.id);
    expect(listTodoLists(db)).toHaveLength(0);

    sqlite.close();
  });

  it('creates misc and task-linked items with CRUD', () => {
    const { db, sqlite, project } = setupDb();
    const list = createTodoList(db, { name: 'Session' });
    const task = createTask(db, { projectId: project.id, title: 'Ship feature' });

    const misc = createTodoItem(db, {
      todoListId: list.id,
      title: 'Buy coffee',
    });
    expect(misc.taskId).toBeNull();
    expect(misc.title).toBe('Buy coffee');

    const linked = createTodoItem(db, {
      todoListId: list.id,
      taskId: task.id,
    });
    expect(linked.taskId).toBe(task.id);
    expect(linked.task?.title).toBe('Ship feature');

    const items = listTodoItems(db, list.id);
    expect(items).toHaveLength(2);

    const updated = updateTodoItem(db, misc.id, { completed: true });
    expect(updated.completed).toBe(true);

    deleteTodoItem(db, misc.id);
    expect(listTodoItems(db, list.id)).toHaveLength(1);

    deleteTask(db, task.id);
    expect(listTodoItems(db, list.id)).toHaveLength(0);

    sqlite.close();
  });

  it('throws when creating a misc item without a title', () => {
    const { db, sqlite } = setupDb();
    const list = createTodoList(db, { name: 'Session' });

    expect(() => createTodoItem(db, { todoListId: list.id })).toThrow(
      'Todo item title is required when not linking a task',
    );

    sqlite.close();
  });
});
