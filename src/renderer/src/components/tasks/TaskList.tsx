import { useEffect, useMemo, useState } from 'react';
import { MoreVertical, Plus, Upload } from 'lucide-react';
import { useTasks } from '@renderer/context/TasksContext';
import { TaskListItem } from '@renderer/components/tasks/TaskListItem';
import { TaskModal } from '@renderer/components/tasks/TaskModal';
import { TaskImportModal } from '@renderer/components/tasks/TaskImportModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_SECTION_STYLES,
} from '@renderer/lib/taskStatus';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@renderer/types/task';

type TaskListProps = {
  projectId: string;
};

export function TaskList({ projectId }: TaskListProps) {
  const { tasksForProject, deleteTask, updateTask } = useTasks();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const tasks = tasksForProject(projectId);

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      TASK_STATUSES.map((status) => [status, [] as Task[]]),
    ) as Record<TaskStatus, Task[]>;

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [tasks]);

  useEffect(() => {
    setCreateModalOpen(false);
    setImportModalOpen(false);
    setEditingTask(null);
    setDeletingTask(null);
  }, [projectId]);

  const handleDelete = () => {
    if (!deletingTask) return;
    deleteTask(deletingTask.id);
    setDeletingTask(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Tasks</h2>
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus aria-hidden="true" />
            Add task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="More task actions"
              >
                <MoreVertical aria-hidden="true" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setImportModalOpen(true)}>
                <Upload />
                Import tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-5">
        {TASK_STATUSES.map((status) => {
          const sectionTasks = tasksByStatus[status];
          const styles = TASK_STATUS_SECTION_STYLES[status];

          return (
            <section
              key={status}
              aria-labelledby={`task-status-${status}`}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden="true" />
                <h3
                  id={`task-status-${status}`}
                  className={cn('text-xs font-semibold uppercase tracking-wide', styles.label)}
                >
                  {TASK_STATUS_LABELS[status]}
                </h3>
                <span className="text-xs text-muted-foreground">{sectionTasks.length}</span>
              </div>

              {sectionTasks.length === 0 ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">No tasks</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border divide-y divide-border">
                  {sectionTasks.map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={setDeletingTask}
                      onStatusChange={(taskToUpdate, status) =>
                        updateTask(taskToUpdate.id, { status })
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <TaskModal
        open={createModalOpen}
        projectId={projectId}
        onClose={() => setCreateModalOpen(false)}
      />

      <TaskImportModal
        open={importModalOpen}
        projectId={projectId}
        onClose={() => setImportModalOpen(false)}
      />

      <TaskModal
        open={editingTask !== null}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />

      <ConfirmModal
        open={deletingTask !== null}
        title={`Delete ${deletingTask?.title ?? 'task'}?`}
        description="This action cannot be undone. The task will be permanently removed."
        confirmLabel="Delete task"
        destructive
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
