# Cotidiano — agent map

Desktop task/project app: **Electron 35**, **React 19**, **TypeScript**, **SQLite** (better-sqlite3 + Drizzle), **Tailwind v4**, **shadcn/ui**.

## Architecture (read this first)

```
Renderer (React)  ←window.electronAPI→  Preload (contextBridge)  ←IPC→  Main (Node)
                                                                              ↓
                                                                         SQLite DB
```

- **Persistence**: Projects and tasks are stored in SQLite. Renderer contexts call `window.electronAPI` when available; they also support in-memory fallbacks for tests without the bridge.
- **Security**: `contextIsolation: true`, `nodeIntegration: false`. Never import Node APIs in renderer code.

## Where to look

| Area | Path | AGENTS.md |
|------|------|-----------|
| Main process | `src/main/` | `src/main/AGENTS.md` |
| Preload bridge | `src/preload/` | `src/preload/AGENTS.md` |
| Shared IPC/types | `src/shared/` | `src/shared/AGENTS.md` |
| React UI | `src/renderer/src/` | `src/renderer/src/AGENTS.md` |
| E2E tests | `e2e/` | `e2e/AGENTS.md` |

## Commands

```bash
npm run dev          # HMR dev (rebuilds native sqlite on predev)
npm run typecheck    # main + renderer TS
npm run test:run     # Vitest (renderer jsdom + main node)
npm run test:e2e     # build + Playwright against real Electron
npm run db:generate  # drizzle-kit generate after schema changes
```

## Path aliases (renderer only)

- `@/*` and `@renderer/*` → `src/renderer/src/*`

## Adding features (typical flow)

1. **Schema** — `src/main/db/schema.ts` + `npm run db:generate` + SQL migration in `src/main/db/migrations/`
2. **Repository** — `src/main/db/repositories/<entity>.ts`
3. **IPC** — channel in `src/shared/ipc/channels.ts`, handler in `src/main/ipc/`, expose in `src/preload/index.ts` + `index.d.ts`
4. **Types** — `src/shared/types/` (re-exported from `src/renderer/src/types/` when needed)
5. **UI state** — extend `ProjectsContext` / `TasksContext` or add a new provider under `src/renderer/src/context/`

## Conventions

- Tests colocated as `*.test.ts(x)`; UI primitives under `components/ui/` are excluded from coverage.
- Prefer extending existing patterns (context + modal + list) over new state libraries.
- README may lag behind code; trust `schema.ts` and contexts for current behavior.
