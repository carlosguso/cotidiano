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
  tagsForProject: (projectId: string) => string[];
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (taskId: string, input: UpdateTaskInput) => void;
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
        .filter((task) => task.projectId === projectId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [tasks],
  );

  const tagsForProject = useCallback(
    (projectId: string) => {
      const tags = tasks
        .filter((task) => task.projectId === projectId)
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
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTasks((current) => [...current, task]);
    return task;
  }, []);

  const updateTask = useCallback((taskId: string, input: UpdateTaskInput) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          ...input,
          title: input.title?.trim() ?? task.title,
          description: input.description?.trim() ?? task.description,
          tags: input.tags ? normalizeTags(input.tags) : task.tags,
          updatedAt: now(),
        };
      }),
    );
  }, []);

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
      tagsForProject,
      createTask,
      updateTask,
      deleteTask,
      deleteTasksForProject,
    }),
    [tasks, tasksForProject, tagsForProject, createTask, updateTask, deleteTask, deleteTasksForProject],
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
