# Database layer

**Stack**: better-sqlite3 + Drizzle ORM (SQLite).

## Key files

| File | Purpose |
|------|---------|
| `schema.ts` | Table definitions — source of truth for structure |
| `client.ts` | `initDatabase`, `getDatabase`, `runMigrations`, singleton |
| `path.ts` | `resolveDatabasePath()` — prod vs `COTIDIANO_DB_PATH` |
| `index.ts` | Re-exports |
| `migrations/` | Generated SQL + Drizzle meta (see `migrations/AGENTS.md`) |
| `repositories/` | CRUD + mapping rows ↔ shared types |

## Tables (current)

- `projects` — id, name, identifier (unique), description, color, status, timestamps
- `tasks` — belongs to project (cascade delete), title, description, status, archived flag
- `tags` + `task_tags` — per-project tag names, many-to-many with tasks
- `app_meta` — placeholder for future settings

## Workflow for schema changes

1. Edit `schema.ts`
2. `npm run db:generate` (drizzle-kit)
3. Commit new SQL under `migrations/`
4. `electron-vite` copies migrations to `out/main/migrations` on build (`electron.vite.config.ts`)

## Access pattern

Repositories receive `AppDatabase` from `getDatabase()` (must call `initDatabase` first in `main/index.ts`).

Tests use `:memory:` or temp files via `createDatabaseClient` — see `client.test.ts`.
