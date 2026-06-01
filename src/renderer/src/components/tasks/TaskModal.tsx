import { useEffect, useState, type FormEvent } from 'react';
import type { Task, TaskStatus } from '@renderer/types/task';
import { useTasks } from '@renderer/context/TasksContext';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@renderer/lib/taskStatus';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type TaskModalProps = {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  task?: Task | null;
};

export function TaskModal({ open, onClose, projectId, task = null }: TaskModalProps) {
  const isEditing = task !== null;
  const { createTask, updateTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
    }

    setError(null);
  }, [open, isEditing, task]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    if (isEditing) {
      updateTask(task.id, {
        title: trimmedTitle,
        description,
        status,
      });
    } else if (projectId) {
      createTask({
        projectId,
        title: trimmedTitle,
        description,
        status,
      });
    }

    onClose();
  };

  return (
    <Dialog
      open={open && (isEditing ? task !== null : projectId !== undefined)}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit task' : 'Create task'}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              autoFocus
              placeholder="Design homepage"
              value={title}
              onChange={(event) => {
                setError(null);
                setTitle(event.target.value);
              }}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="What needs to be done?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {TASK_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {TASK_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Create task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
