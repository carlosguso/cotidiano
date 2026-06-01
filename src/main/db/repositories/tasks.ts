import { eq } from 'drizzle-orm';
import { normalizeTags } from '../../../shared/lib/taskTags';
import type {
  CreateTaskInput,
  ImportTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../../../shared/types/task';
import type { AppDatabase } from '../client';
import { tasks } from '../schema';
import { getTagNamesByTaskIds, getTagNamesForTask, setTaskTags } from './tags';

type TaskRow = typeof tasks.$inferSelect;

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function toTask(row: TaskRow, tagNames: string[]): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    tags: tagNames,
    archived: row.archived,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function loadTasksWithTags(db: AppDatabase, rows: TaskRow[]): Task[] {
  const tagNamesByTaskId = getTagNamesByTaskIds(
    db,
    rows.map((row) => row.id),
  );

  return rows.map((row) => toTask(row, tagNamesByTaskId.get(row.id) ?? []));
}

function buildTask(input: CreateTaskInput, timestamp = now()): Task {
  return {
    id: createId(),
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    status: input.status ?? 'todo',
    tags: normalizeTags(input.tags ?? []),
    archived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function insertTask(db: AppDatabase, task: Task): void {
  db.insert(tasks)
    .values({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      archived: task.archived,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
    .run();

  setTaskTags(db, task.id, task.projectId, task.tags);
}

export function listTasks(db: AppDatabase): Task[] {
  const rows = db.select().from(tasks).all();
  return loadTasksWithTags(db, rows);
}

export function createTask(db: AppDatabase, input: CreateTaskInput): Task {
  const task = buildTask(input);
  insertTask(db, task);
  return task;
}

export function importTasks(
  db: AppDatabase,
  projectId: string,
  inputs: ImportTaskInput[],
): Task[] {
  if (inputs.length === 0) {
    return [];
  }

  const timestamp = now();
  const imported = inputs.map((input) =>
    buildTask(
      {
        ...input,
        projectId,
      },
      timestamp,
    ),
  );

  for (const task of imported) {
    insertTask(db, task);
  }

  return imported;
}

export function updateTask(db: AppDatabase, taskId: string, input: UpdateTaskInput): Task {
  const existing = db.select().from(tasks).where(eq(tasks.id, taskId)).get();

  if (!existing) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const currentTags = getTagNamesForTask(db, taskId);
  const current = toTask(existing, currentTags);
  const updated: Task = {
    ...current,
    ...input,
    title: input.title?.trim() ?? current.title,
    description: input.description?.trim() ?? current.description,
    tags: input.tags !== undefined ? normalizeTags(input.tags) : current.tags,
    archived: input.archived !== undefined ? input.archived : current.archived,
    updatedAt: now(),
  };

  db.update(tasks)
    .set({
      title: updated.title,
      description: updated.description,
      status: updated.status,
      archived: updated.archived,
      updatedAt: updated.updatedAt,
    })
    .where(eq(tasks.id, taskId))
    .run();

  if (input.tags !== undefined) {
    setTaskTags(db, taskId, existing.projectId, updated.tags);
  }

  return updated;
}

export function deleteTask(db: AppDatabase, taskId: string): void {
  const result = db.delete(tasks).where(eq(tasks.id, taskId)).run();

  if (result.changes === 0) {
    throw new Error(`Task not found: ${taskId}`);
  }
}

export function deleteTasksForProject(db: AppDatabase, projectId: string): void {
  db.delete(tasks).where(eq(tasks.projectId, projectId)).run();
}
