# Main process

Entry: `index.ts` — initializes DB, registers IPC, creates `BrowserWindow`.

## Startup sequence

1. `resolveDatabasePath()` — user data dir, overridable via `COTIDIANO_DB_PATH` (used in E2E)
2. `initDatabase(path)` — opens SQLite, runs Drizzle migrations
3. `registerProjectsIpc()` / `registerTasksIpc()` / `registerTodosIpc()`
4. `createWindow()` — preload at `../preload/index.js`, loads dev URL or `renderer/index.html`

## Subdirectories

| Folder | Role |
|--------|------|
| `db/` | Schema, client, migrations, repositories |
| `ipc/` | `ipcMain.handle` wrappers → repositories |

## Tests

Main-process unit tests live next to source (`*.test.ts`), Vitest **node** environment (`vitest.config.ts` → project `main`).

## When changing IPC

Always update in lockstep:

1. `src/shared/ipc/channels.ts`
2. `src/main/ipc/<domain>.ts`
3. `src/preload/index.ts` + `index.d.ts`
4. Renderer contexts or `in-memory-electron-api.ts` for tests
