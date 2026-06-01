# IPC channel names

`channels.ts` exports `PROJECTS_IPC` and `TASKS_IPC` as `as const` objects.

**These strings are the contract** between preload `invoke` and main `handle`. Changing a value requires updating all three: channels file, preload, main ipc.

Naming pattern: `<domain>:<action>` (e.g. `tasks:deleteByProject`).

Do not add renderer-only events here — this app uses request/response `invoke/handle` only (no `send`/`on` yet).
