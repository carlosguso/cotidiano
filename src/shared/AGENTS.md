# Shared code (main + preload + type re-exports)

Cross-process contracts that must not depend on Electron UI or React.

```
shared/
├── ipc/channels.ts    # IPC channel name constants
├── types/             # Project, Task, Todo, Tag DTOs
└── lib/taskTags.ts    # Tag normalization (used by main repos + renderer)
```

## Import paths

- Main/preload: `../../shared/...` (relative)
- Renderer: prefer `@renderer/types/*` which re-export from here

## Why separate from renderer `types/`?

Renderer `types/project.ts` and `types/task.ts` are **re-exports** of shared types so UI code uses `@renderer/types` without reaching into `shared/` directly. Single source of truth remains `src/shared/types/`.
