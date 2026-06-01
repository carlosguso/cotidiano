import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../shared/types/project';
import type {
  CreateTaskInput,
  ImportTaskInput,
  Task,
  UpdateTaskInput,
} from '../shared/types/task';

export interface ElectronAPI {
  platform: NodeJS.Platform;
  projects: {
    list: () => Promise<Project[]>;
    create: (input: CreateProjectInput) => Promise<Project>;
    update: (id: string, input: UpdateProjectInput) => Promise<Project>;
    delete: (id: string) => Promise<void>;
  };
  tasks: {
    list: () => Promise<Task[]>;
    create: (input: CreateTaskInput) => Promise<Task>;
    import: (projectId: string, inputs: ImportTaskInput[]) => Promise<Task[]>;
    update: (id: string, input: UpdateTaskInput) => Promise<Task>;
    delete: (id: string) => Promise<void>;
    deleteByProject: (projectId: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
