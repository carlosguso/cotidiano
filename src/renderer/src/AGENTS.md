# Renderer application

Linear-inspired project/task UI for a desktop Electron app.

## App shell

```
App.tsx
  ProjectsProvider → TasksProvider → TodosProvider → AppLayout
                                                      ├── Sidebar
                                                      ├── MainContent (ProjectDetail | TodoListDetail)
                                                      ├── ProjectModal (create)
                                                      └── TodoListModal (create)
```

## State

| Layer | Location | Notes |
|-------|----------|-------|
| Server truth | SQLite via `electronAPI` | Loaded on mount in contexts |
| UI state | React context | `ProjectsContext`, `TasksContext`, `TodosContext` |
| Local UI | component `useState` | modals, sidebar collapse |

Contexts dual-mode: if `window.electronAPI` exists, persist via IPC; else in-memory (tests with seeded `initialProjects` / `initialTasks`).

## Folders

| Path | AGENTS.md |
|------|-----------|
| `context/` | Providers + hooks |
| `components/` | Feature UI |
| `layouts/` | `AppLayout` shell |
| `lib/` | Pure helpers (colors, import, tags) |
| `types/` | Re-exports from `shared/types` |
| `test/` | Vitest setup, `renderWithProviders`, in-memory API |

## Styling

- Tailwind utility classes, zinc dark theme
- shadcn/ui in `components/ui/` — add via `npx shadcn@latest add <name>`
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge)

## Testing entry

Use `renderWithProviders` from `test/test-utils.tsx`. See `test/AGENTS.md`.
