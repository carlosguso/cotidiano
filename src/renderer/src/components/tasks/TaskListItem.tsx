import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@renderer/types/task';
import { TASK_STATUS_LABELS } from '@renderer/lib/taskStatus';
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
};

export function TaskListItem({ task, onEdit, onDelete }: TaskListItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              'text-sm font-medium text-foreground',
              task.status === 'done' && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </p>
          <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
        {task.description ? (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        ) : null}
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
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
