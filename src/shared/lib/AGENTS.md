# Shared libraries

## `taskTags.ts`

`normalizeTags(tags: string[])` — dedupe, trim, lowercase for storage keys; display casing may differ in UI.

Used by:

- `src/main/db/repositories/tasks.ts` (persistence)
- `src/renderer/src/lib/taskTags.ts` (re-export for contexts/components)

**Keep one implementation** — renderer should not fork normalization logic.
