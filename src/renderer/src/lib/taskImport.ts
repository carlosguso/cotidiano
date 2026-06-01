import { TASK_STATUSES } from '@renderer/lib/taskStatus';
import { normalizeTags } from '@renderer/lib/taskTags';
import type { CreateTaskInput, TaskStatus } from '@renderer/types/task';

export type TaskImportRow = {
  title: string;
  description?: string;
  status?: TaskStatus;
  tags?: string[];
};

export type ParsedTaskImport = {
  tasks: TaskImportRow[];
};

export function parseTasksImportFile(contents: string): ParsedTaskImport | { error: string } {
  let parsed: unknown;

  try {
    parsed = JSON.parse(contents);
  } catch {
    return { error: 'File must be valid JSON.' };
  }

  if (!Array.isArray(parsed)) {
    return { error: 'File must contain a JSON array of tasks.' };
  }

  const tasks: TaskImportRow[] = [];

  for (let index = 0; index < parsed.length; index += 1) {
    const row = parsed[index];

    if (!row || typeof row !== 'object') {
      return { error: `Row ${index + 1} is not a valid task object.` };
    }

    const record = row as Record<string, unknown>;
    const title = record.title;

    if (typeof title !== 'string' || !title.trim()) {
      return { error: `Row ${index + 1} is missing a valid title.` };
    }

    if (record.description !== undefined && typeof record.description !== 'string') {
      return { error: `Row ${index + 1} has an invalid description.` };
    }

    if (
      record.status !== undefined &&
      (typeof record.status !== 'string' || !TASK_STATUSES.includes(record.status as TaskStatus))
    ) {
      return { error: `Row ${index + 1} has an invalid status.` };
    }

    if (record.tags !== undefined) {
      if (!Array.isArray(record.tags) || record.tags.some((tag) => typeof tag !== 'string')) {
        return { error: `Row ${index + 1} has invalid tags.` };
      }
    }

    tasks.push({
      title: title.trim(),
      description: typeof record.description === 'string' ? record.description : undefined,
      status: record.status as TaskStatus | undefined,
      tags: record.tags as string[] | undefined,
    });
  }

  return { tasks };
}

export function toCreateTaskInputs(
  projectId: string,
  rows: TaskImportRow[],
): CreateTaskInput[] {
  return rows.map((row) => ({
    projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    tags: row.tags ? normalizeTags(row.tags) : [],
  }));
}
