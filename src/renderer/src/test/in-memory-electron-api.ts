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

export type InMemoryElectronAPI = Window['electronAPI'];

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function createInMemoryElectronAPI(seed?: {
  projects?: Project[];
  tasks?: Task[];
}): InMemoryElectronAPI {
  let projects = [...(seed?.projects ?? [])];
  let tasks = [...(seed?.tasks ?? [])];

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
      },
      deleteByProject: async (projectId: string) => {
        tasks = tasks.filter((task) => task.projectId !== projectId);
      },
    },
  };
}

export function installInMemoryElectronAPI(seed?: {
  projects?: Project[];
  tasks?: Task[];
}): InMemoryElectronAPI {
  window.electronAPI = createInMemoryElectronAPI(seed);
  return window.electronAPI;
}

export function clearElectronAPI(): void {
  Reflect.deleteProperty(window, 'electronAPI');
}
