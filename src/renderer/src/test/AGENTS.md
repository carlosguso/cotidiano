# Renderer test infrastructure

## Setup (`setup.ts`)

- `@testing-library/jest-dom`
- `cleanup` + `clearElectronAPI()` after each test
- Mocks: `ResizeObserver`, `matchMedia`, deterministic `crypto.randomUUID`

## `test-utils.tsx`

`renderWithProviders(ui, options)` wraps `ProjectsProvider` + `TasksProvider`.

| Option | Effect |
|--------|--------|
| `initialProjects` / `initialTasks` | Seed React state directly (no IPC) |
| `initialSelectedProjectId` | Pre-select project |
| `useInMemoryElectronAPI: true` | Install `window.electronAPI` mock; providers load via IPC-like path |

## `in-memory-electron-api.ts`

In-process implementation of `ElectronAPI` for integration-style renderer tests. Mirrors repository behavior (trim, uppercase identifier, tag normalization).

- `createInMemoryElectronAPI(seed?)` — factory
- `installInMemoryElectronAPI` / `clearElectronAPI` — global window hook

## Fixtures

- `fixtures/projects.ts`, `fixtures/tasks.ts` — typed sample data
- `fixtures/tasks-import.json` — import modal / e2e sample

## Coverage

Vitest excludes `test/**`, `components/ui/**`, `main.tsx` — see `vitest.config.ts`.
