import { ipcMain } from 'electron';
import { getDatabase } from '../db';
import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  listTodoItems,
  listTodoLists,
  updateTodoItem,
  updateTodoList,
} from '../db/repositories/todos';
import { TODOS_IPC } from '../../shared/ipc/channels';
import type {
  CreateTodoItemInput,
  CreateTodoListInput,
  UpdateTodoItemInput,
  UpdateTodoListInput,
} from '../../shared/types/todo';

export function registerTodosIpc(): void {
  ipcMain.handle(TODOS_IPC.listLists, () => {
    return listTodoLists(getDatabase());
  });

  ipcMain.handle(TODOS_IPC.createList, (_event, input: CreateTodoListInput) => {
    return createTodoList(getDatabase(), input);
  });

  ipcMain.handle(
    TODOS_IPC.updateList,
    (_event, payload: { id: string; input: UpdateTodoListInput }) => {
      return updateTodoList(getDatabase(), payload.id, payload.input);
    },
  );

  ipcMain.handle(TODOS_IPC.deleteList, (_event, id: string) => {
    deleteTodoList(getDatabase(), id);
  });

  ipcMain.handle(TODOS_IPC.listItems, (_event, todoListId: string) => {
    return listTodoItems(getDatabase(), todoListId);
  });

  ipcMain.handle(TODOS_IPC.createItem, (_event, input: CreateTodoItemInput) => {
    return createTodoItem(getDatabase(), input);
  });

  ipcMain.handle(
    TODOS_IPC.updateItem,
    (_event, payload: { id: string; input: UpdateTodoItemInput }) => {
      return updateTodoItem(getDatabase(), payload.id, payload.input);
    },
  );

  ipcMain.handle(TODOS_IPC.deleteItem, (_event, id: string) => {
    deleteTodoItem(getDatabase(), id);
  });
}
