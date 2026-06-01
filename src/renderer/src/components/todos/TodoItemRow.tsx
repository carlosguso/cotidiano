import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { useTodos } from '@renderer/context/TodosContext';
import type { TodoItemWithTask } from '@renderer/types/todo';
import { TASK_STATUS_LABELS } from '@renderer/lib/taskStatus';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type TodoItemRowProps = {
  item: TodoItemWithTask;
  onEdit: (item: TodoItemWithTask) => void;
  onDelete: (item: TodoItemWithTask) => void;
};

export function TodoItemRow({ item, onEdit, onDelete }: TodoItemRowProps) {
  const { updateTodoItem } = useTodos();
  const { projects } = useProjects();

  const project =
    item.task && projects.find((entry) => entry.id === item.task?.projectId);

  const handleToggleCompleted = async () => {
    await updateTodoItem(item.id, { completed: !item.completed });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={item.completed ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
          onClick={handleToggleCompleted}
          className={cn('size-7 shrink-0', item.completed && 'border-primary/40 bg-primary/10')}
        >
          {item.completed ? (
            <Check aria-hidden="true" strokeWidth={2} className="size-3.5 text-primary" />
          ) : (
            <span className="size-2 rounded-full bg-muted-foreground/50" aria-hidden="true" />
          )}
        </Button>

        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              'truncate text-sm text-foreground',
              item.completed && 'text-muted-foreground line-through',
            )}
          >
            {item.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {item.taskId ? (
              <>
                {project ? (
                  <span className="rounded-md border border-border px-1.5 py-0.5 font-medium tracking-wide">
                    {project.identifier}
                  </span>
                ) : null}
                {item.task ? (
                  <span>{TASK_STATUS_LABELS[item.task.status]}</span>
                ) : (
                  <span>Linked task unavailable</span>
                )}
              </>
            ) : (
              <span>Misc</span>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${item.title}`}>
            <MoreVertical aria-hidden="true" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!item.taskId ? (
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
            <Trash2 />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
