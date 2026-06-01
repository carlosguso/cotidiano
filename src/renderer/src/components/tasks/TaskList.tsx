import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '@renderer/context/TasksContext';
import { TaskListItem } from '@renderer/components/tasks/TaskListItem';
import { TaskModal } from '@renderer/components/tasks/TaskModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import type { Task } from '@renderer/types/task';

type TaskListProps = {
  projectId: string;
};

export function TaskList({ projectId }: TaskListProps) {
  const { tasksForProject, deleteTask } = useTasks();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const tasks = tasksForProject(projectId);

  useEffect(() => {
    setCreateModalOpen(false);
    setEditingTask(null);
    setDeletingTask(null);
  }, [projectId]);

  const handleDelete = () => {
    if (!deletingTask) return;
    deleteTask(deletingTask.id);
    setDeletingTask(null);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Tasks</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(true)}>
          <Plus aria-hidden="true" />
          Add task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
            />
          ))}
        </div>
      )}

      <TaskModal
        open={createModalOpen}
        projectId={projectId}
        onClose={() => setCreateModalOpen(false)}
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
