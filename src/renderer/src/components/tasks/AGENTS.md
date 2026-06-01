# Task UI

Tasks belong to a **project** (`projectId`). Shown inside `ProjectDetail` when a project is selected.

| Component | Role |
|-----------|------|
| `TaskList` | Active + archived sections for current project |
| `TaskListItem` | Row with status, tags, actions |
| `TaskModal` | Create/edit task — status, tags, description |
| `TaskImportModal` | Bulk JSON import via `lib/taskImport.ts` |

## Context usage

- `useTasks()` — `tasksForProject`, `archivedTasksForProject`, `createTask`, `importTasks`, etc.
- `useProjects()` — ensure `selectedProject` before creating tasks

## Task model (UI)

- **status** — todo / in progress / done (see `lib/taskStatus.ts`)
- **archived** — soft hide from active list; `archiveTask` / `restoreTask`
- **tags** — string array on `Task`, normalized on write

## Import flow

`TaskImportModal` parses JSON (see `test/fixtures/tasks-import.json`), validates shape, calls `importTasks(projectId, inputs)`.

## Tests

`TaskList.test.tsx`, `TaskModal.test.tsx`, `TaskImportModal.test.tsx`.
