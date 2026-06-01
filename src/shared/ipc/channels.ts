export const PROJECTS_IPC = {
  list: 'projects:list',
  create: 'projects:create',
  update: 'projects:update',
  delete: 'projects:delete',
} as const;

export const TASKS_IPC = {
  list: 'tasks:list',
  create: 'tasks:create',
  import: 'tasks:import',
  update: 'tasks:update',
  delete: 'tasks:delete',
  deleteByProject: 'tasks:deleteByProject',
} as const;

export const TODOS_IPC = {
  listLists: 'todos:listLists',
  createList: 'todos:createList',
  updateList: 'todos:updateList',
  deleteList: 'todos:deleteList',
  listItems: 'todos:listItems',
  createItem: 'todos:createItem',
  updateItem: 'todos:updateItem',
  deleteItem: 'todos:deleteItem',
} as const;
