import { normalizeTags } from '../../../shared/lib/taskTags';
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../../../shared/types/project';
import type {
  CreateTaskInput,
  ImportTaskInput,
  Task,
  UpdateTaskInput,
} from '../../../shared/types/task';
import type {
  CreateTodoItemInput,
  CreateTodoListInput,
  TodoItem,
  TodoItemWithTask,
  TodoList,
  UpdateTodoItemInput,
  UpdateTodoListInput,
} from '../../../shared/types/todo';

export type InMemoryElectronAPI = Window['electronAPI'];

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function resolveTodoItemTask(taskId: string | null, tasks: Task[]): Task | null {
  if (!taskId) return null;
  return tasks.find((task) => task.id === taskId) ?? null;
}

function nextTodoItemPosition(items: TodoItem[], todoListId: string): number {
  const positions = items
    .filter((item) => item.todoListId === todoListId)
    .map((item) => item.position);
  return (positions.length === 0 ? -1 : Math.max(...positions)) + 1;
}

export function createInMemoryElectronAPI(seed?: {
  projects?: Project[];
  tasks?: Task[];
  todoLists?: TodoList[];
  todoItems?: TodoItemWithTask[];
}): InMemoryElectronAPI {
  let projects = [...(seed?.projects ?? [])];
  let tasks = [...(seed?.tasks ?? [])];
  let todoLists = [...(seed?.todoLists ?? [])];
  let todoItems = [...(seed?.todoItems ?? [])];

  return {
    platform: 'darwin',
    projects: {
      list: async () => [...projects],
      create: async (input: CreateProjectInput) => {
        const timestamp = now();
        const project: Project = {
          id: createId(),
          name: input.name.trim(),
          identifier: input.identifier.trim().toUpperCase(),
          description: input.description?.trim() ?? '',
          color: input.color ?? 'blue',
          status: 'active',
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        projects = [...projects, project];
        return project;
      },
      update: async (id: string, input: UpdateProjectInput) => {
        const index = projects.findIndex((project) => project.id === id);
        if (index === -1) {
          throw new Error(`Project not found: ${id}`);
        }

        const current = projects[index];
        const updated: Project = {
          ...current,
          ...input,
          name: input.name?.trim() ?? current.name,
          identifier: input.identifier?.trim().toUpperCase() ?? current.identifier,
          description: input.description?.trim() ?? current.description,
          updatedAt: now(),
        };
        projects = projects.map((project) => (project.id === id ? updated : project));
        return updated;
      },
      delete: async (id: string) => {
        const index = projects.findIndex((project) => project.id === id);
        if (index === -1) {
          throw new Error(`Project not found: ${id}`);
        }
        projects = projects.filter((project) => project.id !== id);
        tasks = tasks.filter((task) => task.projectId !== id);
      },
    },
    tasks: {
      list: async () => [...tasks],
      create: async (input: CreateTaskInput) => {
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
        tasks = [...tasks, task];
        return task;
      },
      import: async (projectId: string, inputs: ImportTaskInput[]) => {
        if (inputs.length === 0) {
          return [];
        }

        const timestamp = now();
        const imported = inputs.map((input) => ({
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
        tasks = [...tasks, ...imported];
        return imported;
      },
      update: async (id: string, input: UpdateTaskInput) => {
        const index = tasks.findIndex((task) => task.id === id);
        if (index === -1) {
          throw new Error(`Task not found: ${id}`);
        }

        const current = tasks[index];
        const updated: Task = {
          ...current,
          ...input,
          title: input.title?.trim() ?? current.title,
          description: input.description?.trim() ?? current.description,
          tags: input.tags !== undefined ? normalizeTags(input.tags) : current.tags,
          archived: input.archived !== undefined ? input.archived : current.archived,
          updatedAt: now(),
        };
        tasks = tasks.map((task) => (task.id === id ? updated : task));
        return updated;
      },
      delete: async (id: string) => {
        tasks = tasks.filter((task) => task.id !== id);
        todoItems = todoItems.filter((item) => item.taskId !== id);
      },
      deleteByProject: async (projectId: string) => {
        tasks = tasks.filter((task) => task.projectId !== projectId);
        todoItems = todoItems.filter((item) => {
          if (!item.taskId) return true;
          const task = tasks.find((entry) => entry.id === item.taskId);
          return Boolean(task);
        });
      },
    },
    todos: {
      listLists: async () => [...todoLists].sort((a, b) => a.name.localeCompare(b.name)),
      createList: async (input: CreateTodoListInput) => {
        const timestamp = now();
        const list: TodoList = {
          id: createId(),
          name: input.name.trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        todoLists = [...todoLists, list].sort((a, b) => a.name.localeCompare(b.name));
        return list;
      },
      updateList: async (id: string, input: UpdateTodoListInput) => {
        const index = todoLists.findIndex((list) => list.id === id);
        if (index === -1) {
          throw new Error(`Todo list not found: ${id}`);
        }

        const current = todoLists[index];
        const updated: TodoList = {
          ...current,
          ...input,
          name: input.name?.trim() ?? current.name,
          updatedAt: now(),
        };
        todoLists = todoLists
          .map((list) => (list.id === id ? updated : list))
          .sort((a, b) => a.name.localeCompare(b.name));
        return updated;
      },
      deleteList: async (id: string) => {
        const index = todoLists.findIndex((list) => list.id === id);
        if (index === -1) {
          throw new Error(`Todo list not found: ${id}`);
        }
        todoLists = todoLists.filter((list) => list.id !== id);
        todoItems = todoItems.filter((item) => item.todoListId !== id);
      },
      listItems: async (todoListId: string) => {
        return todoItems
          .filter((item) => item.todoListId === todoListId)
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            ...item,
            task: resolveTodoItemTask(item.taskId, tasks),
          }));
      },
      createItem: async (input: CreateTodoItemInput) => {
        const linkedTask = resolveTodoItemTask(input.taskId ?? null, tasks);
        if (input.taskId && !linkedTask) {
          throw new Error(`Task not found: ${input.taskId}`);
        }

        const title = linkedTask?.title ?? input.title?.trim() ?? '';
        if (!title) {
          throw new Error('Todo item title is required when not linking a task');
        }

        const timestamp = now();
        const item: TodoItemWithTask = {
          id: createId(),
          todoListId: input.todoListId,
          taskId: input.taskId ?? null,
          title,
          completed: input.completed ?? false,
          position: input.position ?? nextTodoItemPosition(todoItems, input.todoListId),
          createdAt: timestamp,
          updatedAt: timestamp,
          task: linkedTask,
        };
        todoItems = [...todoItems, item];
        return item;
      },
      updateItem: async (id: string, input: UpdateTodoItemInput) => {
        const index = todoItems.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new Error(`Todo item not found: ${id}`);
        }

        const existing = todoItems[index];
        let taskId = existing.taskId;
        let title = existing.title;
        let linkedTask: Task | null = null;

        if (input.taskId !== undefined) {
          taskId = input.taskId;

          if (taskId) {
            linkedTask = resolveTodoItemTask(taskId, tasks);
            if (!linkedTask) {
              throw new Error(`Task not found: ${taskId}`);
            }
            title = linkedTask.title;
          } else {
            title = input.title?.trim() ?? existing.title;
            if (!title) {
              throw new Error('Todo item title is required when not linking a task');
            }
          }
        } else if (input.title !== undefined) {
          if (existing.taskId) {
            throw new Error('Cannot change title of a task-linked todo item');
          }
          title = input.title.trim();
          if (!title) {
            throw new Error('Todo item title cannot be empty');
          }
        } else if (existing.taskId) {
          linkedTask = resolveTodoItemTask(existing.taskId, tasks);
          title = linkedTask?.title ?? existing.title;
        }

        const updated: TodoItemWithTask = {
          ...existing,
          taskId,
          title,
          completed: input.completed !== undefined ? input.completed : existing.completed,
          position: input.position !== undefined ? input.position : existing.position,
          updatedAt: now(),
          task: linkedTask,
        };

        if (!linkedTask && updated.taskId) {
          updated.task = resolveTodoItemTask(updated.taskId, tasks);
        }

        todoItems = todoItems.map((item) => (item.id === id ? updated : item));
        return updated;
      },
      deleteItem: async (id: string) => {
        todoItems = todoItems.filter((item) => item.id !== id);
      },
    },
  };
}

export function installInMemoryElectronAPI(seed?: {
  projects?: Project[];
  tasks?: Task[];
  todoLists?: TodoList[];
  todoItems?: TodoItemWithTask[];
}): InMemoryElectronAPI {
  window.electronAPI = createInMemoryElectronAPI(seed);
  return window.electronAPI;
}

export function clearElectronAPI(): void {
  Reflect.deleteProperty(window, 'electronAPI');
}
