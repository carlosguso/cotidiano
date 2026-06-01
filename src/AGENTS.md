# `src/` — three Electron processes + shared code

```
src/
├── main/       # Node: window lifecycle, DB, IPC handlers
├── preload/    # contextBridge → window.electronAPI
├── renderer/   # Vite + React (UI only)
└── shared/     # Types + IPC channel names (importable from main & preload)
```

## Dependency rules

| From | Can import |
|------|------------|
| `renderer/src` | `@renderer/*`, re-exports from `shared/types` via `types/` |
| `preload` | `shared/ipc`, `shared/types` |
| `main` | `shared/*`, `main/db/*`, Node/Electron |
| `shared` | No Electron, no React, no DB |

## Build output (`electron-vite`)

- `out/main/` — main + copied `migrations/`
- `out/preload/` — preload script
- `out/renderer/` — static assets for production

See nested `AGENTS.md` in each subdirectory.
