import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTasks } from '@renderer/context/TasksContext';
import type {
  CreateTodoItemInput,
  CreateTodoListInput,
  TodoItemWithTask,
  TodoList,
  UpdateTodoItemInput,
  UpdateTodoListInput,
} from '@renderer/types/todo';
import type { Task } from '@renderer/types/task';

type TodosContextValue = {
  todoLists: TodoList[];
  todoItems: TodoItemWithTask[];
  selectedTodoListId: string | null;
  selectedTodoList: TodoList | null;
  isLoadingLists: boolean;
  isLoadingItems: boolean;
  selectTodoList: (todoListId: string | null) => void;
  itemsForList: (todoListId: string) => TodoItemWithTask[];
  createTodoList: (input: CreateTodoListInput) => Promise<TodoList>;
  updateTodoList: (todoListId: string, input: UpdateTodoListInput) => Promise<void>;
  deleteTodoList: (todoListId: string) => Promise<void>;
  createTodoItem: (input: CreateTodoItemInput) => Promise<TodoItemWithTask>;
  updateTodoItem: (todoItemId: string, input: UpdateTodoItemInput) => Promise<void>;
  deleteTodoItem: (todoItemId: string) => Promise<void>;
  refreshItemsForList: (todoListId: string) => Promise<void>;
};

const TodosContext = createContext<TodosContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function hasTodosApi(): boolean {
  return typeof window.electronAPI?.todos !== 'undefined';
}

function nextTodoItemPosition(items: TodoItemWithTask[], todoListId: string): number {
  const positions = items
    .filter((item) => item.todoListId === todoListId)
    .map((item) => item.position);
  return (positions.length === 0 ? -1 : Math.max(...positions)) + 1;
}

function resolveLinkedTask(taskId: string | null, tasks: Task[]): TodoItemWithTask['task'] {
  if (!taskId) return null;
  return tasks.find((task) => task.id === taskId) ?? null;
}

export function TodosProvider({
  children,
  initialTodoLists = [],
  initialTodoItems = [],
  initialSelectedTodoListId = null,
}: {
  children: ReactNode;
  initialTodoLists?: TodoList[];
  initialTodoItems?: TodoItemWithTask[];
  initialSelectedTodoListId?: string | null;
}) {
  const { tasks } = useTasks();
  const [todoLists, setTodoLists] = useState<TodoList[]>(initialTodoLists);
  const [todoItems, setTodoItems] = useState<TodoItemWithTask[]>(initialTodoItems);
  const [selectedTodoListId, setSelectedTodoListId] = useState<string | null>(
    initialSelectedTodoListId,
  );
  const [isLoadingLists, setIsLoadingLists] = useState(
    () => initialTodoLists.length === 0 && hasTodosApi(),
  );
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [loadedItemListIds, setLoadedItemListIds] = useState<Set<string>>(
    () => new Set(initialTodoItems.map((item) => item.todoListId)),
  );

  useEffect(() => {
    if (initialTodoLists.length > 0 || !hasTodosApi()) {
      return;
    }

    let cancelled = false;

    void window.electronAPI.todos
      .listLists()
      .then((loaded) => {
        if (!cancelled) {
          setTodoLists(loaded);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLists(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialTodoLists.length]);

  const refreshItemsForList = useCallback(async (todoListId: string) => {
    if (!hasTodosApi()) {
      return;
    }

    setIsLoadingItems(true);

    try {
      const loaded = await window.electronAPI.todos.listItems(todoListId);
      setTodoItems((current) => [
        ...current.filter((item) => item.todoListId !== todoListId),
        ...loaded,
      ]);
      setLoadedItemListIds((current) => new Set(current).add(todoListId));
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedTodoListId || !hasTodosApi()) {
      return;
    }

    if (loadedItemListIds.has(selectedTodoListId)) {
      return;
    }

    void refreshItemsForList(selectedTodoListId);
  }, [selectedTodoListId, loadedItemListIds, refreshItemsForList]);

  const selectedTodoList = useMemo(
    () => todoLists.find((list) => list.id === selectedTodoListId) ?? null,
    [todoLists, selectedTodoListId],
  );

  const itemsForList = useCallback(
    (todoListId: string) =>
      todoItems
        .filter((item) => item.todoListId === todoListId)
        .sort((a, b) => a.position - b.position),
    [todoItems],
  );

  const selectTodoList = useCallback((todoListId: string | null) => {
    setSelectedTodoListId(todoListId);
  }, []);

  const createTodoList = useCallback(async (input: CreateTodoListInput): Promise<TodoList> => {
    if (hasTodosApi()) {
      const list = await window.electronAPI.todos.createList(input);
      setTodoLists((current) => [...current, list].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTodoListId(list.id);
      return list;
    }

    const timestamp = now();
    const list: TodoList = {
      id: createId(),
      name: input.name.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTodoLists((current) => [...current, list].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedTodoListId(list.id);
    return list;
  }, []);

  const updateTodoList = useCallback(
    async (todoListId: string, input: UpdateTodoListInput): Promise<void> => {
      if (hasTodosApi()) {
        const updated = await window.electronAPI.todos.updateList(todoListId, input);
        setTodoLists((current) =>
          current
            .map((list) => (list.id === todoListId ? updated : list))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        return;
      }

      setTodoLists((current) =>
        current
          .map((list) => {
            if (list.id !== todoListId) return list;

            return {
              ...list,
              ...input,
              name: input.name?.trim() ?? list.name,
              updatedAt: now(),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    },
    [],
  );

  const deleteTodoList = useCallback(async (todoListId: string): Promise<void> => {
    if (hasTodosApi()) {
      await window.electronAPI.todos.deleteList(todoListId);
      setTodoLists((current) => current.filter((list) => list.id !== todoListId));
      setTodoItems((current) => current.filter((item) => item.todoListId !== todoListId));
      setLoadedItemListIds((current) => {
        const next = new Set(current);
        next.delete(todoListId);
        return next;
      });
      setSelectedTodoListId((current) => (current === todoListId ? null : current));
      return;
    }

    setTodoLists((current) => current.filter((list) => list.id !== todoListId));
    setTodoItems((current) => current.filter((item) => item.todoListId !== todoListId));
    setLoadedItemListIds((current) => {
      const next = new Set(current);
      next.delete(todoListId);
      return next;
    });
    setSelectedTodoListId((current) => (current === todoListId ? null : current));
  }, []);

  const createTodoItem = useCallback(
    async (input: CreateTodoItemInput): Promise<TodoItemWithTask> => {
      if (hasTodosApi()) {
        const item = await window.electronAPI.todos.createItem(input);
        setTodoItems((current) => [...current, item]);
        setLoadedItemListIds((current) => new Set(current).add(input.todoListId));
        return item;
      }

      const timestamp = now();
      const position =
        input.position ?? nextTodoItemPosition(todoItems, input.todoListId);
      const linkedTask = resolveLinkedTask(input.taskId ?? null, tasks);

      if (!input.taskId && !input.title?.trim()) {
        throw new Error('Todo item title is required when not linking a task');
      }

      const item: TodoItemWithTask = {
        id: createId(),
        todoListId: input.todoListId,
        taskId: input.taskId ?? null,
        title: linkedTask?.title ?? input.title?.trim() ?? '',
        completed: input.completed ?? false,
        position,
        createdAt: timestamp,
        updatedAt: timestamp,
        task: linkedTask,
      };

      setTodoItems((current) => [...current, item]);
      return item;
    },
    [todoItems, tasks],
  );

  const updateTodoItem = useCallback(
    async (todoItemId: string, input: UpdateTodoItemInput): Promise<void> => {
      if (hasTodosApi()) {
        const updated = await window.electronAPI.todos.updateItem(todoItemId, input);
        setTodoItems((current) =>
          current.map((item) => (item.id === todoItemId ? updated : item)),
        );
        return;
      }

      setTodoItems((current) =>
        current.map((item) => {
          if (item.id !== todoItemId) return item;

          const taskId = input.taskId !== undefined ? input.taskId : item.taskId;
          const linkedTask = resolveLinkedTask(taskId, tasks);

          return {
            ...item,
            ...input,
            taskId,
            title:
              linkedTask?.title ??
              (input.title !== undefined ? input.title.trim() : item.title),
            completed: input.completed !== undefined ? input.completed : item.completed,
            position: input.position !== undefined ? input.position : item.position,
            task: linkedTask,
            updatedAt: now(),
          };
        }),
      );
    },
    [tasks],
  );

  const deleteTodoItem = useCallback(async (todoItemId: string): Promise<void> => {
    if (hasTodosApi()) {
      await window.electronAPI.todos.deleteItem(todoItemId);
      setTodoItems((current) => current.filter((item) => item.id !== todoItemId));
      return;
    }

    setTodoItems((current) => current.filter((item) => item.id !== todoItemId));
  }, []);

  const value = useMemo(
    () => ({
      todoLists,
      todoItems,
      selectedTodoListId,
      selectedTodoList,
      isLoadingLists,
      isLoadingItems,
      selectTodoList,
      itemsForList,
      createTodoList,
      updateTodoList,
      deleteTodoList,
      createTodoItem,
      updateTodoItem,
      deleteTodoItem,
      refreshItemsForList,
    }),
    [
      todoLists,
      todoItems,
      selectedTodoListId,
      selectedTodoList,
      isLoadingLists,
      isLoadingItems,
      selectTodoList,
      itemsForList,
      createTodoList,
      updateTodoList,
      deleteTodoList,
      createTodoItem,
      updateTodoItem,
      deleteTodoItem,
      refreshItemsForList,
    ],
  );

  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

export function useTodos(): TodosContextValue {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
}
