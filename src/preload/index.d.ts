import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../shared/types/project';

export interface ElectronAPI {
  platform: NodeJS.Platform;
  projects: {
    list: () => Promise<Project[]>;
    create: (input: CreateProjectInput) => Promise<Project>;
    update: (id: string, input: UpdateProjectInput) => Promise<Project>;
    delete: (id: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
