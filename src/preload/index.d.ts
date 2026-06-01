import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../shared/types/project';
import type {
  CreateTaskInput,
  ImportTaskInput,
  Task,
  UpdateTaskInput,
} from '../shared/types/task';
import type {
  CreateTodoItemInput,
  CreateTodoListInput,
  TodoItemWithTask,
  TodoList,
  UpdateTodoItemInput,
  UpdateTodoListInput,
} from '../shared/types/todo';

export interface ElectronAPI {
  platform: NodeJS.Platform;
  projects: {
    list: () => Promise<Project[]>;
    create: (input: CreateProjectInput) => Promise<Project>;
    update: (id: string, input: UpdateProjectInput) => Promise<Project>;
    delete: (id: string) => Promise<void>;
  };
  tasks: {
    list: () => Promise<Task[]>;
    create: (input: CreateTaskInput) => Promise<Task>;
    import: (projectId: string, inputs: ImportTaskInput[]) => Promise<Task[]>;
    update: (id: string, input: UpdateTaskInput) => Promise<Task>;
    delete: (id: string) => Promise<void>;
    deleteByProject: (projectId: string) => Promise<void>;
  };
  todos: {
    listLists: () => Promise<TodoList[]>;
    createList: (input: CreateTodoListInput) => Promise<TodoList>;
    updateList: (id: string, input: UpdateTodoListInput) => Promise<TodoList>;
    deleteList: (id: string) => Promise<void>;
    listItems: (todoListId: string) => Promise<TodoItemWithTask[]>;
    createItem: (input: CreateTodoItemInput) => Promise<TodoItemWithTask>;
    updateItem: (id: string, input: UpdateTodoItemInput) => Promise<TodoItemWithTask>;
    deleteItem: (id: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
