import type { Task } from './task';

export type TodoList = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TodoItem = {
  id: string;
  todoListId: string;
  taskId: string | null;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TodoItemWithTask = TodoItem & {
  task: Task | null;
};

export type CreateTodoListInput = {
  name: string;
};

export type UpdateTodoListInput = Partial<Pick<TodoList, 'name'>>;

export type CreateTodoItemInput = {
  todoListId: string;
  taskId?: string;
  title?: string;
  completed?: boolean;
  position?: number;
};

export type UpdateTodoItemInput = Partial<
  Pick<TodoItem, 'title' | 'completed' | 'position' | 'taskId'>
>;
