# IPC handlers (main process)

Each file exports `register*Ipc()` called from `main/index.ts`.

| File | Channels (see `shared/ipc/channels.ts`) |
|------|-------------------------------------------|
| `projects.ts` | `projects:list`, `create`, `update`, `delete` |
| `tasks.ts` | `tasks:list`, `create`, `import`, `update`, `delete`, `deleteByProject` |

## Pattern

```ts
ipcMain.handle(CHANNEL, (_event, payload) => repositoryFn(getDatabase(), ...));
```

- Handlers are **thin** — no business logic beyond typing payloads
- `update` channels often pass `{ id, input }` objects from preload
- `delete` returns `void`; list/create/update return entities

## Extending

1. Add constant to `PROJECTS_IPC` or `TASKS_IPC` (or new object)
2. Implement handler + repository function
3. Mirror in preload `ElectronAPI` and renderer context / in-memory test API
