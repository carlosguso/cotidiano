# React contexts

## `ProjectsContext`

- **State**: all projects, `selectedProjectId`, `isLoading`
- **Derived**: `activeProjects` (status === `active`, sorted by name), `selectedProject`
- **Actions**: `selectProject`, `createProject`, `updateProject`, `deleteProject`
- **Load**: `useEffect` calls `electronAPI.projects.list()` when no `initialProjects` and API exists
- **Test props**: `initialProjects`, `initialSelectedProjectId` skip fetch

## `TasksContext`

- **State**: flat `tasks[]`, `isLoading`
- **Derived helpers**: `tasksForProject`, `archivedTasksForProject`, `tagsForProject`
- **Actions**: CRUD, `importTasks`, `archiveTask` / `restoreTask` (archive = `archived: true`), `deleteTasksForProject`
- **Tags**: normalized via `@renderer/lib/taskTags` on create/update/import

## Pattern for new domain data

1. Add IPC + repository + shared types
2. Create `*Context.tsx` with provider + `use*` hook
3. Mirror dual-path: `has*Api()` → IPC, else local state mutation
4. Wrap in `App.tsx` **outside** layout if needed globally

## Tests

`ProjectsContext.test.tsx`, `TasksContext.test.tsx` — use `renderWithProviders` or direct provider with seeds / `useInMemoryElectronAPI: true`.
