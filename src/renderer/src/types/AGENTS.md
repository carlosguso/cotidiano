# Renderer type re-exports

Thin barrels over `src/shared/types/`:

- `project.ts` → `Project`, inputs, `ProjectColor`, `ProjectStatus`
- `task.ts` → `Task`, inputs, status types

**Import in UI as** `@renderer/types/project` — do not duplicate type definitions here.

If a type is renderer-only (e.g. view model), add it in a new file under this folder; domain DTOs still belong in `shared/types/`.
