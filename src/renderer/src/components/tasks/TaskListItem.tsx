import { Archive, Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskStatus } from '@renderer/types/task';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_SECTION_STYLES,
} from '@renderer/lib/taskStatus';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type TaskListItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onArchive: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

export function TaskListItem({
  task,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
}: TaskListItemProps) {
  const statusStyles = TASK_STATUS_SECTION_STYLES[task.status];

  return (
    <div className="flex items-center justify-between gap-3 bg-background px-4 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="self-center shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Change status for ${task.title}`}
                className="size-7 shrink-0"
              >
                <span className={cn('size-2 rounded-full', statusStyles.dot)} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {TASK_STATUSES.map((status) => {
                const optionStyles = TASK_STATUS_SECTION_STYLES[status];
                const selected = status === task.status;

                return (
                  <DropdownMenuItem
                    key={status}
                    disabled={selected}
                    onClick={() => onStatusChange(task, status)}
                  >
                    <span className={cn('size-2 rounded-full', optionStyles.dot)} aria-hidden="true" />
                    {TASK_STATUS_LABELS[status]}
                    {selected ? <Check className="ml-auto" aria-hidden="true" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                'text-sm font-medium text-foreground',
                task.status === 'done' && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </p>
            {task.description ? (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            ) : null}
          </div>
          {task.tags.length > 0 ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Task actions for ${task.title}`}
          >
            <MoreVertical aria-hidden="true" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive(task)}>
            <Archive />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
