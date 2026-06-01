import { and, eq, inArray } from 'drizzle-orm';
import { normalizeTags } from '../../../shared/lib/taskTags';
import type { AppDatabase } from '../client';
import { tags, taskTags } from '../schema';

function createId(): string {
  return crypto.randomUUID();
}

function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

export function resolveTagIds(db: AppDatabase, projectId: string, tagNames: string[]): string[] {
  const normalizedNames = normalizeTags(tagNames);
  const tagIds: string[] = [];

  for (const name of normalizedNames) {
    const normalizedName = normalizeTagName(name);
    const existing = db
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.projectId, projectId), eq(tags.normalizedName, normalizedName)))
      .get();

    if (existing) {
      tagIds.push(existing.id);
      continue;
    }

    const id = createId();
    db.insert(tags)
      .values({
        id,
        projectId,
        name,
        normalizedName,
      })
      .run();
    tagIds.push(id);
  }

  return tagIds;
}

export function setTaskTags(
  db: AppDatabase,
  taskId: string,
  projectId: string,
  tagNames: string[],
): void {
  db.delete(taskTags).where(eq(taskTags.taskId, taskId)).run();

  const tagIds = resolveTagIds(db, projectId, tagNames);
  for (const tagId of tagIds) {
    db.insert(taskTags)
      .values({
        taskId,
        tagId,
      })
      .run();
  }
}

export function getTagNamesForTask(db: AppDatabase, taskId: string): string[] {
  const rows = db
    .select({ name: tags.name })
    .from(taskTags)
    .innerJoin(tags, eq(taskTags.tagId, tags.id))
    .where(eq(taskTags.taskId, taskId))
    .all();

  return normalizeTags(rows.map((row) => row.name));
}

export function getTagNamesByTaskIds(
  db: AppDatabase,
  taskIds: string[],
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (taskIds.length === 0) {
    return result;
  }

  for (const taskId of taskIds) {
    result.set(taskId, []);
  }

  const rows = db
    .select({
      taskId: taskTags.taskId,
      name: tags.name,
    })
    .from(taskTags)
    .innerJoin(tags, eq(taskTags.tagId, tags.id))
    .where(inArray(taskTags.taskId, taskIds))
    .all();

  for (const row of rows) {
    const names = result.get(row.taskId);
    if (names) {
      names.push(row.name);
    }
  }

  for (const taskId of taskIds) {
    result.set(taskId, normalizeTags(result.get(taskId) ?? []));
  }

  return result;
}

export function listTagNamesForProject(db: AppDatabase, projectId: string): string[] {
  const rows = db
    .select({ name: tags.name })
    .from(tags)
    .where(eq(tags.projectId, projectId))
    .all();

  return rows.map((row) => row.name).sort((a, b) => a.localeCompare(b));
}
