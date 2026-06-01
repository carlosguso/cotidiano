# Preload script

**Role**: The only bridge between renderer and main. Exposes `window.electronAPI` via `contextBridge.exposeInMainWorld`.

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Builds API object, maps to `ipcRenderer.invoke` |
| `index.d.ts` | `ElectronAPI` interface + `Window` augmentation |

## API surface (must stay in sync)

- `platform` — `process.platform`
- `projects` — list, create, update, delete
- `tasks` — list, create, import, update, delete, deleteByProject

Channel strings live in `src/shared/ipc/channels.ts` — import those constants here, never hardcode strings.

## Rules

- No DOM or React imports
- Keep methods as thin `invoke` wrappers
- When adding a method, update `index.d.ts` first (types drive preload + renderer)

## Testing

Renderer tests do **not** load this file. Use `src/renderer/src/test/in-memory-electron-api.ts` to simulate the same contract in jsdom.
