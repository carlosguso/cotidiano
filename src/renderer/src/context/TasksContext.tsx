import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@renderer/types/task';
import { normalizeTags } from '@renderer/lib/taskTags';

type TasksContextValue = {
  tasks: Task[];
  tasksForProject: (projectId: string) => Task[];
  archivedTasksForProject: (projectId: string) => Task[];
  tagsForProject: (projectId: string) => string[];
  createTask: (input: CreateTaskInput) => Task;
  importTasks: (projectId: string, inputs: Omit<CreateTaskInput, 'projectId'>[]) => number;
  updateTask: (taskId: string, input: UpdateTaskInput) => void;
  archiveTask: (taskId: string) => void;
  restoreTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteTasksForProject: (projectId: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function TasksProvider({
  children,
  initialTasks = [],
}: {
  children: ReactNode;
  initialTasks?: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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

  const createTask = useCallback((input: CreateTaskInput): Task => {
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
    (projectId: string, inputs: Omit<CreateTaskInput, 'projectId'>[]): number => {
      if (inputs.length === 0) return 0;

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

  const updateTask = useCallback((taskId: string, input: UpdateTaskInput) => {
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

  const archiveTask = useCallback((taskId: string) => {
    updateTask(taskId, { archived: true });
  }, [updateTask]);

  const restoreTask = useCallback((taskId: string) => {
    updateTask(taskId, { archived: false });
  }, [updateTask]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const deleteTasksForProject = useCallback((projectId: string) => {
    setTasks((current) => current.filter((task) => task.projectId !== projectId));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
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
