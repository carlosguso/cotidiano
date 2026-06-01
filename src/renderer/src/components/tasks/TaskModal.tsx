import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskStatus } from '@renderer/types/task';
import { useTasks } from '@renderer/context/TasksContext';
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@renderer/lib/taskStatus';
import { normalizeTags } from '@renderer/lib/taskTags';
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
  const { createTask, updateTask, tagsForProject } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resolvedProjectId = isEditing ? task.projectId : projectId;
  const suggestedTags = resolvedProjectId ? tagsForProject(resolvedProjectId) : [];

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setTags(task.tags);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setTags([]);
    }

    setTagInput('');
    setError(null);
  }, [open, isEditing, task]);

  const addTag = (value: string) => {
    const nextTags = normalizeTags([...tags, value]);
    if (nextTags.length === tags.length) return;
    setTags(nextTags);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addTag(tagInput);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const nextTags = normalizeTags(tagInput ? [...tags, tagInput] : tags);

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    try {
      if (isEditing) {
        await updateTask(task.id, {
          title: trimmedTitle,
          description,
          status,
          tags: nextTags,
        });
      } else if (projectId) {
        await createTask({
          projectId,
          title: trimmedTitle,
          description,
          status,
          tags: nextTags,
        });
      }

      onClose();
    } catch {
      setError('Could not save the task. Please try again.');
    }
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
            <Label htmlFor="task-tags">Tags</Label>
            <div className="rounded-md border border-input px-3 py-2 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
              {tags.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        aria-label={`Remove tag ${tag}`}
                        className="rounded-sm text-muted-foreground hover:text-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <Input
                id="task-tags"
                list="task-tag-suggestions"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              <datalist id="task-tag-suggestions">
                {suggestedTags
                  .filter((tag) => !tags.some((selected) => selected.toLowerCase() === tag.toLowerCase()))
                  .map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
              </datalist>
            </div>
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
