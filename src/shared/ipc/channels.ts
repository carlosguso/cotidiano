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
