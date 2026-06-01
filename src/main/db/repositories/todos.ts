import { asc, eq, max } from 'drizzle-orm';
import type {
  CreateTodoItemInput,
  CreateTodoListInput,
  TodoItem,
  TodoItemWithTask,
  TodoList,
  UpdateTodoItemInput,
  UpdateTodoListInput,
} from '../../../shared/types/todo';
import type { AppDatabase } from '../client';
import { todoItems, todoLists, tasks } from '../schema';
import { getTagNamesByTaskIds } from './tags';
import type { Task, TaskStatus } from '../../../shared/types/task';

type TodoListRow = typeof todoLists.$inferSelect;
type TodoItemRow = typeof todoItems.$inferSelect;
type TaskRow = typeof tasks.$inferSelect;

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function toTodoList(row: TodoListRow): TodoList {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toTodoItem(row: TodoItemRow): TodoItem {
  return {
    id: row.id,
    todoListId: row.todoListId,
    taskId: row.taskId,
    title: row.title,
    completed: row.completed,
    position: row.position,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toTask(row: TaskRow, tagNames: string[]): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    tags: tagNames,
    archived: row.archived,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function loadTasksById(db: AppDatabase, taskIds: string[]): Map<string, Task> {
  if (taskIds.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(taskIds)];
  const rows = db
    .select()
    .from(tasks)
    .all()
    .filter((row) => uniqueIds.includes(row.id));
  const tagNamesByTaskId = getTagNamesByTaskIds(
    db,
    rows.map((row) => row.id),
  );

  return new Map(
    rows.map((row) => [row.id, toTask(row, tagNamesByTaskId.get(row.id) ?? [])]),
  );
}

function assertTodoListExists(db: AppDatabase, todoListId: string): void {
  const list = db.select().from(todoLists).where(eq(todoLists.id, todoListId)).get();
  if (!list) {
    throw new Error(`Todo list not found: ${todoListId}`);
  }
}

function nextPosition(db: AppDatabase, todoListId: string): number {
  const result = db
    .select({ maxPosition: max(todoItems.position) })
    .from(todoItems)
    .where(eq(todoItems.todoListId, todoListId))
    .get();

  return (result?.maxPosition ?? -1) + 1;
}

export function listTodoLists(db: AppDatabase): TodoList[] {
  return db
    .select()
    .from(todoLists)
    .all()
    .map(toTodoList)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function createTodoList(db: AppDatabase, input: CreateTodoListInput): TodoList {
  const timestamp = now();
  const list: TodoList = {
    id: createId(),
    name: input.name.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.insert(todoLists)
    .values({
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    })
    .run();

  return list;
}

export function updateTodoList(
  db: AppDatabase,
  todoListId: string,
  input: UpdateTodoListInput,
): TodoList {
  const existing = db.select().from(todoLists).where(eq(todoLists.id, todoListId)).get();

  if (!existing) {
    throw new Error(`Todo list not found: ${todoListId}`);
  }

  const updated: TodoList = {
    ...toTodoList(existing),
    ...input,
    name: input.name?.trim() ?? existing.name,
    updatedAt: now(),
  };

  db.update(todoLists)
    .set({
      name: updated.name,
      updatedAt: updated.updatedAt,
    })
    .where(eq(todoLists.id, todoListId))
    .run();

  return updated;
}

export function deleteTodoList(db: AppDatabase, todoListId: string): void {
  const result = db.delete(todoLists).where(eq(todoLists.id, todoListId)).run();

  if (result.changes === 0) {
    throw new Error(`Todo list not found: ${todoListId}`);
  }
}

export function listTodoItems(db: AppDatabase, todoListId: string): TodoItemWithTask[] {
  assertTodoListExists(db, todoListId);

  const rows = db
    .select()
    .from(todoItems)
    .where(eq(todoItems.todoListId, todoListId))
    .orderBy(asc(todoItems.position))
    .all();

  const tasksById = loadTasksById(
    db,
    rows.map((row) => row.taskId).filter((taskId): taskId is string => taskId !== null),
  );

  return rows.map((row) => {
    const item = toTodoItem(row);
    return {
      ...item,
      task: item.taskId ? (tasksById.get(item.taskId) ?? null) : null,
    };
  });
}

export function createTodoItem(db: AppDatabase, input: CreateTodoItemInput): TodoItemWithTask {
  assertTodoListExists(db, input.todoListId);

  const timestamp = now();
  let taskId = input.taskId ?? null;
  let title = input.title?.trim() ?? '';
  let linkedTask: Task | null = null;

  if (taskId) {
    const taskRow = db.select().from(tasks).where(eq(tasks.id, taskId)).get();
    if (!taskRow) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const tagNamesByTaskId = getTagNamesByTaskIds(db, [taskId]);
    linkedTask = toTask(taskRow, tagNamesByTaskId.get(taskId) ?? []);
    title = linkedTask.title;
  } else if (!title) {
    throw new Error('Todo item title is required when not linking a task');
  }

  const item: TodoItem = {
    id: createId(),
    todoListId: input.todoListId,
    taskId,
    title,
    completed: input.completed ?? false,
    position: input.position ?? nextPosition(db, input.todoListId),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.insert(todoItems)
    .values({
      id: item.id,
      todoListId: item.todoListId,
      taskId: item.taskId,
      title: item.title,
      completed: item.completed,
      position: item.position,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })
    .run();

  return { ...item, task: linkedTask };
}

export function updateTodoItem(
  db: AppDatabase,
  todoItemId: string,
  input: UpdateTodoItemInput,
): TodoItemWithTask {
  const existing = db.select().from(todoItems).where(eq(todoItems.id, todoItemId)).get();

  if (!existing) {
    throw new Error(`Todo item not found: ${todoItemId}`);
  }

  let taskId = existing.taskId;
  let title = existing.title;
  let linkedTask: Task | null = null;

  if (input.taskId !== undefined) {
    taskId = input.taskId;

    if (taskId) {
      const taskRow = db.select().from(tasks).where(eq(tasks.id, taskId)).get();
      if (!taskRow) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const tagNamesByTaskId = getTagNamesByTaskIds(db, [taskId]);
      linkedTask = toTask(taskRow, tagNamesByTaskId.get(taskId) ?? []);
      title = linkedTask.title;
    } else {
      title = input.title?.trim() ?? existing.title;
      if (!title) {
        throw new Error('Todo item title is required when not linking a task');
      }
    }
  } else if (input.title !== undefined) {
    if (existing.taskId) {
      throw new Error('Cannot change title of a task-linked todo item');
    }
    title = input.title.trim();
    if (!title) {
      throw new Error('Todo item title cannot be empty');
    }
  } else if (existing.taskId) {
    const tasksById = loadTasksById(db, [existing.taskId]);
    linkedTask = tasksById.get(existing.taskId) ?? null;
    title = linkedTask?.title ?? existing.title;
  }

  const updated: TodoItem = {
    ...toTodoItem(existing),
    taskId,
    title,
    completed: input.completed !== undefined ? input.completed : existing.completed,
    position: input.position !== undefined ? input.position : existing.position,
    updatedAt: now(),
  };

  db.update(todoItems)
    .set({
      taskId: updated.taskId,
      title: updated.title,
      completed: updated.completed,
      position: updated.position,
      updatedAt: updated.updatedAt,
    })
    .where(eq(todoItems.id, todoItemId))
    .run();

  if (!linkedTask && updated.taskId) {
    const tasksById = loadTasksById(db, [updated.taskId]);
    linkedTask = tasksById.get(updated.taskId) ?? null;
  }

  return { ...updated, task: linkedTask };
}

export function deleteTodoItem(db: AppDatabase, todoItemId: string): void {
  const result = db.delete(todoItems).where(eq(todoItems.id, todoItemId)).run();

  if (result.changes === 0) {
    throw new Error(`Todo item not found: ${todoItemId}`);
  }
}
