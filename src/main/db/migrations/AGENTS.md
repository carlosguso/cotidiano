# SQL migrations

Drizzle-generated SQL files (`0000_init.sql`, …) plus `meta/` snapshots and `_journal.json`.

## Rules

- **Do not hand-edit** snapshots in `meta/` — regenerate with `npm run db:generate` after `schema.ts` changes
- Migration **order** is defined in `meta/_journal.json`
- At runtime, `runMigrations()` reads from `getMigrationsFolder()` → `__dirname/migrations` (bundled to `out/main/migrations`)

## History (high level)

| Migration | Adds |
|-----------|------|
| `0000_init` | `app_meta` |
| `0001_add_projects` | `projects` |
| `0002_add_tasks` | `tasks` |
| `0003_add_tags_tables` | `tags`, `task_tags` |

## Agent checklist after schema change

1. Update `schema.ts`
2. `npm run db:generate`
3. Review generated `.sql` for destructive ops
4. Run `npm run test:run` (main db tests + e2e if behavior changed)
