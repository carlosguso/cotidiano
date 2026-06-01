import type { TaskStatus } from '@renderer/types/task';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const TASK_STATUS_SECTION_STYLES: Record<
  TaskStatus,
  { dot: string; label: string }
> = {
  todo: { dot: 'bg-muted-foreground', label: 'text-muted-foreground' },
  in_progress: { dot: 'bg-blue-500', label: 'text-blue-400' },
  done: { dot: 'bg-emerald-500', label: 'text-emerald-400' },
};
