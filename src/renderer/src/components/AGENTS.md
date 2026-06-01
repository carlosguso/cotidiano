# UI components

Feature folders own product UI; `ui/` holds generic shadcn primitives.

```
components/
├── projects/   # Project list item, detail, modal, icon
├── tasks/      # Task list, modal, import
├── sidebar/    # App chrome + navigation
└── ui/         # shadcn (Button, Dialog, …) — low agent priority
```

## Patterns

- **Data**: `useProjects()` / `useTasks()` — no direct `electronAPI` in components
- **Modals**: controlled `open` + `onClose`, often with edit target `null` = create mode
- **Destructive actions**: `ConfirmModal` or Radix `AlertDialog` from `ui/`
- **Tests**: colocated `*.test.tsx`, `renderWithProviders`, Testing Library queries

## Adding a feature component

1. Place under the right feature folder
2. Keep components focused; extract hooks only if reused 3+ times
3. Use existing `ui/` primitives before adding new shadcn components

See per-folder `AGENTS.md` for file-level map.
