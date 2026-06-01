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
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_SECTION_STYLES,
} from '@renderer/lib/taskStatus';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const existingTaskIds = useMemo(
    () => new Set(itemsForList(todoListId).map((item) => item.taskId).filter(Boolean)),
    [itemsForList, todoListId],
  );

  const projectOptions = useMemo(
    () =>
      activeProjects
        .map((project) => ({
          value: project.id,
          label: project.name,
          searchText: project.identifier,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [activeProjects],
  );

  const taskOptions = useMemo(() => {
    if (!projectId) return [];

    return tasks
      .filter(
        (task) =>
          task.projectId === projectId && !task.archived && !existingTaskIds.has(task.id),
      )
      .map((task) => ({
        value: task.id,
        label: task.title,
        searchText: `${task.tags.join(' ')} ${TASK_STATUS_LABELS[task.status]}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks, projectId, existingTaskIds]);

  const hasLinkableTasks = useMemo(
    () =>
      tasks.some((task) => !task.archived && !existingTaskIds.has(task.id)),
    [tasks, existingTaskIds],
  );

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setProjectId('');
    setTaskId('');
    setError(null);
  }, [open]);

  useEffect(() => {
    setTaskId('');
  }, [projectId]);

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

    if (!projectId) {
      setError('Select a project.');
      return;
    }

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
              {!hasLinkableTasks ? (
                <p className="text-sm text-muted-foreground">
                  No available tasks. Create tasks in a project first, or they may already be on
                  this list.
                </p>
              ) : (
                <>
                  <SearchableSelect
                    id="todo-item-project"
                    label="Project"
                    placeholder="Search projects…"
                    options={projectOptions}
                    value={projectId}
                    onValueChange={setProjectId}
                    renderOption={(option) => {
                      const project = activeProjects.find((entry) => entry.id === option.value);
                      if (!project) return option.label;

                      return (
                        <div className="flex min-w-0 items-center gap-2">
                          <ProjectIcon project={project} size="sm" />
                          <span className="min-w-0 flex-1 truncate">{project.name}</span>
                          <span className="shrink-0 text-[11px] font-medium tracking-wide text-muted-foreground">
                            {project.identifier}
                          </span>
                        </div>
                      );
                    }}
                  />
                  <SearchableSelect
                    id="todo-item-task"
                    label="Task"
                    placeholder="Search tasks…"
                    options={taskOptions}
                    value={taskId}
                    onValueChange={setTaskId}
                    disabled={!projectId}
                    emptyMessage={
                      projectId
                        ? 'No tasks available in this project.'
                        : 'Choose a project first.'
                    }
                    renderOption={(option) => {
                      const task = tasks.find((entry) => entry.id === option.value);
                      if (!task) return option.label;

                      const statusStyles = TASK_STATUS_SECTION_STYLES[task.status];

                      return (
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn('size-2 shrink-0 rounded-full', statusStyles.dot)}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate">{task.title}</span>
                          <span className={cn('shrink-0 text-xs', statusStyles.label)}>
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                        </div>
                      );
                    }}
                  />
                </>
              )}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!hasLinkableTasks}>
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
