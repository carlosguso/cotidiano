import { contextBridge, ipcRenderer } from 'electron';
import { PROJECTS_IPC } from '../shared/ipc/channels';
import type { ElectronAPI } from './index.d';
import type { CreateProjectInput, UpdateProjectInput } from '../shared/types/project';

const api: ElectronAPI = {
  platform: process.platform,
  projects: {
    list: () => ipcRenderer.invoke(PROJECTS_IPC.list),
    create: (input: CreateProjectInput) => ipcRenderer.invoke(PROJECTS_IPC.create, input),
    update: (id: string, input: UpdateProjectInput) =>
      ipcRenderer.invoke(PROJECTS_IPC.update, { id, input }),
    delete: (id: string) => ipcRenderer.invoke(PROJECTS_IPC.delete, id),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
