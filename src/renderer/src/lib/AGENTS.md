# Renderer utilities (pure functions)

| Module | Purpose |
|--------|---------|
| `utils.ts` | `cn()` — className merge |
| `projectColors.ts` | Color token → Tailwind classes for `ProjectIcon` |
| `taskStatus.ts` | Status labels / styling helpers |
| `taskTags.ts` | Re-export/wrap `shared/lib/taskTags` for renderer |
| `taskImport.ts` | Parse & validate JSON import payloads |

## Rules

- No React hooks, no `window` access (except tests)
- Shared tag logic also lives in `src/shared/lib/taskTags.ts` — keep normalization identical between main and renderer

## Tests

Colocated `*.test.ts` — fast unit tests, no providers needed.
