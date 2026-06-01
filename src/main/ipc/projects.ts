import { ipcMain } from 'electron';
import { getDatabase } from '../db';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../db/repositories/projects';
import { PROJECTS_IPC } from '../../shared/ipc/channels';
import type { CreateProjectInput, UpdateProjectInput } from '../../shared/types/project';

export function registerProjectsIpc(): void {
  ipcMain.handle(PROJECTS_IPC.list, () => {
    return listProjects(getDatabase());
  });

  ipcMain.handle(PROJECTS_IPC.create, (_event, input: CreateProjectInput) => {
    return createProject(getDatabase(), input);
  });

  ipcMain.handle(
    PROJECTS_IPC.update,
    (_event, payload: { id: string; input: UpdateProjectInput }) => {
      return updateProject(getDatabase(), payload.id, payload.input);
    },
  );

  ipcMain.handle(PROJECTS_IPC.delete, (_event, id: string) => {
    deleteProject(getDatabase(), id);
  });
}
