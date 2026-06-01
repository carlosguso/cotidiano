import type { TodoItemWithTask, TodoList } from '@renderer/types/todo';

export function createMockTodoList(overrides: Partial<TodoList> = {}): TodoList {
  return {
    id: 'todo-list-1',
    name: 'Today',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockTodoItem(overrides: Partial<TodoItemWithTask> = {}): TodoItemWithTask {
  return {
    id: 'todo-item-1',
    todoListId: 'todo-list-1',
    taskId: null,
    title: 'Misc note',
    completed: false,
    position: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    task: null,
    ...overrides,
  };
}
