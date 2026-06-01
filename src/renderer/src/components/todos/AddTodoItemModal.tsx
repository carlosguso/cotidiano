import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { useTasks } from '@renderer/context/TasksContext';
import { useTodos } from '@renderer/context/TodosContext';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type AddTodoItemModalProps = {
  open: boolean;
  onClose: () => void;
  todoListId: string;
};

export function AddTodoItemModal({ open, onClose, todoListId }: AddTodoItemModalProps) {
  const { activeProjects } = useProjects();
  const { tasks } = useTasks();
  const { createTodoItem, itemsForList } = useTodos();
  const [title, setTitle] = useState('');
  const [taskId, setTaskId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const existingTaskIds = useMemo(
    () => new Set(itemsForList(todoListId).map((item) => item.taskId).filter(Boolean)),
    [itemsForList, todoListId],
  );

  const taskOptions = useMemo(() => {
    const projectNameById = new Map(activeProjects.map((project) => [project.id, project.name]));

    return tasks
      .filter((task) => !task.archived && !existingTaskIds.has(task.id))
      .map((task) => ({
        id: task.id,
        label: task.title,
        projectName: projectNameById.get(task.projectId) ?? 'Unknown project',
      }))
      .sort((a, b) => a.projectName.localeCompare(b.projectName) || a.label.localeCompare(b.label));
  }, [tasks, activeProjects, existingTaskIds]);

  const tasksByProject = useMemo(() => {
    const grouped = new Map<string, typeof taskOptions>();

    for (const option of taskOptions) {
      const current = grouped.get(option.projectName) ?? [];
      current.push(option);
      grouped.set(option.projectName, current);
    }

    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [taskOptions]);

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setTaskId('');
    setError(null);
  }, [open]);

  const handleMiscSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Item title is required.');
      return;
    }

    await createTodoItem({ todoListId, title: trimmedTitle });
    onClose();
  };

  const handleTaskSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!taskId) {
      setError('Select a task to add.');
      return;
    }

    await createTodoItem({ todoListId, taskId });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to list</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="misc">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="misc">Misc item</TabsTrigger>
            <TabsTrigger value="task">From project</TabsTrigger>
          </TabsList>

          <TabsContent value="misc">
            <form onSubmit={handleMiscSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="todo-item-title">Title</Label>
                <Input
                  id="todo-item-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Quick note for this session"
                  autoFocus
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Add item</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="task">
            <form onSubmit={handleTaskSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="todo-item-task">Task</Label>
                {taskOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No available tasks. Create tasks in a project first, or they may already be on
                    this list.
                  </p>
                ) : (
                  <select
                    id="todo-item-task"
                    value={taskId}
                    onChange={(event) => setTaskId(event.target.value)}
                    className={cn(
                      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs',
                      'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    )}
                  >
                    <option value="">Choose a task</option>
                    {tasksByProject.map(([projectName, options]) => (
                      <optgroup key={projectName} label={projectName}>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={taskOptions.length === 0}>
                  Add task
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
