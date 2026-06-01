import { contextBridge, ipcRenderer } from 'electron';
import { PROJECTS_IPC, TASKS_IPC } from '../shared/ipc/channels';
import type { ElectronAPI } from './index.d';
import type { CreateProjectInput, UpdateProjectInput } from '../shared/types/project';
import type {
  CreateTaskInput,
  ImportTaskInput,
  UpdateTaskInput,
} from '../shared/types/task';

const api: ElectronAPI = {
  platform: process.platform,
  projects: {
    list: () => ipcRenderer.invoke(PROJECTS_IPC.list),
    create: (input: CreateProjectInput) => ipcRenderer.invoke(PROJECTS_IPC.create, input),
    update: (id: string, input: UpdateProjectInput) =>
      ipcRenderer.invoke(PROJECTS_IPC.update, { id, input }),
    delete: (id: string) => ipcRenderer.invoke(PROJECTS_IPC.delete, id),
  },
  tasks: {
    list: () => ipcRenderer.invoke(TASKS_IPC.list),
    create: (input: CreateTaskInput) => ipcRenderer.invoke(TASKS_IPC.create, input),
    import: (projectId: string, inputs: ImportTaskInput[]) =>
      ipcRenderer.invoke(TASKS_IPC.import, { projectId, inputs }),
    update: (id: string, input: UpdateTaskInput) =>
      ipcRenderer.invoke(TASKS_IPC.update, { id, input }),
    delete: (id: string) => ipcRenderer.invoke(TASKS_IPC.delete, id),
    deleteByProject: (projectId: string) =>
      ipcRenderer.invoke(TASKS_IPC.deleteByProject, projectId),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
