import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TasksProvider } from '@renderer/context/TasksContext';
import { TodosProvider, useTodos } from '@renderer/context/TodosContext';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { createMockTodoItem, createMockTodoList } from '@renderer/test/fixtures/todos';
import { installInMemoryElectronAPI } from '@renderer/test/in-memory-electron-api';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <TodosProvider>{children}</TodosProvider>
    </TasksProvider>
  );
}

describe('TodosContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useTodos())).toThrow(
      'useTodos must be used within a TodosProvider',
    );
  });

  it('creates a todo list', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await act(async () => {
      await result.current.createTodoList({ name: 'Today' });
    });

    expect(result.current.todoLists).toHaveLength(1);
    expect(result.current.todoLists[0]).toMatchObject({
      id: 'test-uuid-1',
      name: 'Today',
    });
    expect(result.current.selectedTodoListId).toBe('test-uuid-1');
  });

  it('creates misc and linked todo items', async () => {
    const task = createMockTask({ id: 'task-1', projectId: 'project-1', title: 'Ship feature' });

    const { result } = renderHook(() => useTodos(), {
      wrapper: ({ children }) => (
        <TasksProvider initialTasks={[task]}>
          <TodosProvider
            initialTodoLists={[createMockTodoList()]}
            initialSelectedTodoListId="todo-list-1"
          >
            {children}
          </TodosProvider>
        </TasksProvider>
      ),
    });

    await act(async () => {
      await result.current.createTodoItem({
        todoListId: 'todo-list-1',
        title: 'Buy coffee',
      });
    });

    await act(async () => {
      await result.current.createTodoItem({
        todoListId: 'todo-list-1',
        taskId: 'task-1',
      });
    });

    expect(result.current.itemsForList('todo-list-1')).toHaveLength(2);
    expect(result.current.itemsForList('todo-list-1')[1]).toMatchObject({
      taskId: 'task-1',
      title: 'Ship feature',
      task,
    });
  });

  it('loads lists and items through the in-memory electron API', async () => {
    installInMemoryElectronAPI();

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoadingLists).toBe(false);
    });

    await act(async () => {
      await result.current.createTodoList({ name: 'Session' });
    });

    await act(async () => {
      await result.current.createTodoItem({
        todoListId: result.current.todoLists[0].id,
        title: 'Quick note',
      });
    });

    await waitFor(() => {
      expect(result.current.itemsForList(result.current.todoLists[0].id)).toHaveLength(1);
    });
  });

  it('assigns unique positions after items are deleted', async () => {
    const list = createMockTodoList();
    const itemA = createMockTodoItem({ id: 'item-a', position: 0 });
    const itemB = createMockTodoItem({ id: 'item-b', position: 1, title: 'Second' });

    const { result } = renderHook(() => useTodos(), {
      wrapper: ({ children }) => (
        <TasksProvider>
          <TodosProvider
            initialTodoLists={[list]}
            initialTodoItems={[itemA, itemB]}
            initialSelectedTodoListId={list.id}
          >
            {children}
          </TodosProvider>
        </TasksProvider>
      ),
    });

    await act(async () => {
      await result.current.deleteTodoItem('item-a');
    });

    await act(async () => {
      await result.current.createTodoItem({
        todoListId: list.id,
        title: 'Third',
      });
    });

    const positions = result.current.itemsForList(list.id).map((item) => item.position);
    expect(positions.sort((a, b) => a - b)).toEqual([1, 2]);
  });

  it('updates and deletes todo lists and items', async () => {
    const list = createMockTodoList();
    const item = createMockTodoItem();

    const { result } = renderHook(() => useTodos(), {
      wrapper: ({ children }) => (
        <TasksProvider>
          <TodosProvider
            initialTodoLists={[list]}
            initialTodoItems={[item]}
            initialSelectedTodoListId={list.id}
          >
            {children}
          </TodosProvider>
        </TasksProvider>
      ),
    });

    await act(async () => {
      await result.current.updateTodoList(list.id, { name: 'Tomorrow' });
    });

    expect(result.current.todoLists[0].name).toBe('Tomorrow');

    await act(async () => {
      await result.current.updateTodoItem(item.id, { completed: true });
    });

    expect(result.current.itemsForList(list.id)[0].completed).toBe(true);

    await act(async () => {
      await result.current.deleteTodoItem(item.id);
    });

    expect(result.current.itemsForList(list.id)).toHaveLength(0);

    await act(async () => {
      await result.current.deleteTodoList(list.id);
    });

    expect(result.current.todoLists).toHaveLength(0);
    expect(result.current.selectedTodoListId).toBeNull();
  });
});
