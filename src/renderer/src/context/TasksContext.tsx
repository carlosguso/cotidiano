import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@renderer/types/task';
import { normalizeTags } from '@renderer/lib/taskTags';

type TasksContextValue = {
  tasks: Task[];
  isLoading: boolean;
  tasksForProject: (projectId: string) => Task[];
  archivedTasksForProject: (projectId: string) => Task[];
  tagsForProject: (projectId: string) => string[];
  createTask: (input: CreateTaskInput) => Promise<Task>;
  importTasks: (projectId: string, inputs: Omit<CreateTaskInput, 'projectId'>[]) => Promise<number>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteTasksForProject: (projectId: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function hasTasksApi(): boolean {
  return typeof window.electronAPI?.tasks !== 'undefined';
}

export function TasksProvider({
  children,
  initialTasks = [],
}: {
  children: ReactNode;
  initialTasks?: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(
    () => initialTasks.length === 0 && hasTasksApi(),
  );

  useEffect(() => {
    if (initialTasks.length > 0 || !hasTasksApi()) {
      return;
    }

    let cancelled = false;

    void window.electronAPI.tasks
      .list()
      .then((loaded) => {
        if (!cancelled) {
          setTasks(loaded);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialTasks.length]);

  const tasksForProject = useCallback(
    (projectId: string) =>
      tasks
        .filter((task) => task.projectId === projectId && !task.archived)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [tasks],
  );

  const archivedTasksForProject = useCallback(
    (projectId: string) =>
      tasks
        .filter((task) => task.projectId === projectId && task.archived)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [tasks],
  );

  const tagsForProject = useCallback(
    (projectId: string) => {
      const tags = tasks
        .filter((task) => task.projectId === projectId && !task.archived)
        .flatMap((task) => task.tags);

      return normalizeTags(tags).sort((a, b) => a.localeCompare(b));
    },
    [tasks],
  );

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    if (hasTasksApi()) {
      const task = await window.electronAPI.tasks.create(input);
      setTasks((current) => [...current, task]);
      return task;
    }

    const timestamp = now();
    const task: Task = {
      id: createId(),
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      status: input.status ?? 'todo',
      tags: normalizeTags(input.tags ?? []),
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTasks((current) => [...current, task]);
    return task;
  }, []);

  const importTasks = useCallback(
    async (projectId: string, inputs: Omit<CreateTaskInput, 'projectId'>[]): Promise<number> => {
      if (inputs.length === 0) return 0;

      if (hasTasksApi()) {
        const imported = await window.electronAPI.tasks.import(projectId, inputs);
        setTasks((current) => [...current, ...imported]);
        return imported.length;
      }

      const timestamp = now();
      const importedTasks: Task[] = inputs.map((input) => ({
        id: createId(),
        projectId,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        status: input.status ?? 'todo',
        tags: normalizeTags(input.tags ?? []),
        archived: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }));

      setTasks((current) => [...current, ...importedTasks]);
      return importedTasks.length;
    },
    [],
  );

  const updateTask = useCallback(async (taskId: string, input: UpdateTaskInput): Promise<void> => {
    if (hasTasksApi()) {
      const updated = await window.electronAPI.tasks.update(taskId, input);
      setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));
      return;
    }

    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          ...input,
          title: input.title?.trim() ?? task.title,
          description: input.description?.trim() ?? task.description,
          tags: input.tags !== undefined ? normalizeTags(input.tags) : task.tags,
          archived: input.archived !== undefined ? input.archived : task.archived,
          updatedAt: now(),
        };
      }),
    );
  }, []);

  const archiveTask = useCallback(
    async (taskId: string): Promise<void> => {
      await updateTask(taskId, { archived: true });
    },
    [updateTask],
  );

  const restoreTask = useCallback(
    async (taskId: string): Promise<void> => {
      await updateTask(taskId, { archived: false });
    },
    [updateTask],
  );

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    if (hasTasksApi()) {
      await window.electronAPI.tasks.delete(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const deleteTasksForProject = useCallback(async (projectId: string): Promise<void> => {
    if (hasTasksApi()) {
      await window.electronAPI.tasks.deleteByProject(projectId);
      setTasks((current) => current.filter((task) => task.projectId !== projectId));
      return;
    }

    setTasks((current) => current.filter((task) => task.projectId !== projectId));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      tasksForProject,
      archivedTasksForProject,
      tagsForProject,
      createTask,
      importTasks,
      updateTask,
      archiveTask,
      restoreTask,
      deleteTask,
      deleteTasksForProject,
    }),
    [
      tasks,
      isLoading,
      tasksForProject,
      archivedTasksForProject,
      tagsForProject,
      createTask,
      importTasks,
      updateTask,
      archiveTask,
      restoreTask,
      deleteTask,
      deleteTasksForProject,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
