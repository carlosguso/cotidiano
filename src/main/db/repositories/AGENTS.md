# Repositories

Thin data access between IPC handlers and Drizzle/SQLite. One file per aggregate:

- `projects.ts` — list, create, update, delete projects
- `tasks.ts` — tasks + tag normalization on create/update/import
- `tags.ts` — tag upsert/lookup per project (used by tasks repo)

## Contract

- **Input/output types** come from `src/shared/types/` (`Project`, `Task`, `Create*Input`, etc.)
- **IDs & timestamps** are created in the repository (UUID + ISO strings) unless updating
- **Errors** — throw on not-found; IPC layer does not translate errors today

## Tags + tasks

Task rows store core fields; tags are normalized (see `src/shared/lib/taskTags.ts`) and persisted via `tags` + `task_tags`. Import/create paths should use the same normalization as the renderer (`normalizeTags`).

## Tests

`*.test.ts` here run in Vitest **node** env with in-memory or temp DB — good place to verify SQL edge cases without React.

## Adding a repository

1. Add table(s) in `schema.ts` + migration
2. Create `repositories/<name>.ts` with functions taking `AppDatabase`
3. Wire `src/main/ipc/<name>.ts` and preload API
