import { ipcMain } from 'electron';
import { getDatabase } from '../db';
import {
  createTask,
  deleteTask,
  deleteTasksForProject,
  importTasks,
  listTasks,
  updateTask,
} from '../db/repositories/tasks';
import { TASKS_IPC } from '../../shared/ipc/channels';
import type {
  CreateTaskInput,
  ImportTaskInput,
  UpdateTaskInput,
} from '../../shared/types/task';

export function registerTasksIpc(): void {
  ipcMain.handle(TASKS_IPC.list, () => {
    return listTasks(getDatabase());
  });

  ipcMain.handle(TASKS_IPC.create, (_event, input: CreateTaskInput) => {
    return createTask(getDatabase(), input);
  });

  ipcMain.handle(
    TASKS_IPC.import,
    (_event, payload: { projectId: string; inputs: ImportTaskInput[] }) => {
      return importTasks(getDatabase(), payload.projectId, payload.inputs);
    },
  );

  ipcMain.handle(
    TASKS_IPC.update,
    (_event, payload: { id: string; input: UpdateTaskInput }) => {
      return updateTask(getDatabase(), payload.id, payload.input);
    },
  );

  ipcMain.handle(TASKS_IPC.delete, (_event, id: string) => {
    deleteTask(getDatabase(), id);
  });

  ipcMain.handle(TASKS_IPC.deleteByProject, (_event, projectId: string) => {
    deleteTasksForProject(getDatabase(), projectId);
  });
}
