# Sidebar

`Sidebar.tsx` — left rail: project list, collapse toggle, "new project" action.

## Props / callbacks

- `onCreateProject` — opens create `ProjectModal` (state lives in `AppLayout`)

## Behavior

- Lists `activeProjects` from `useProjects()`
- `selectProject(id)` updates selection → `ProjectDetail` renders
- Collapsed mode hides labels (tested in `Sidebar.test.tsx`)

## Layout

Sibling to `ProjectDetail` inside `AppLayout` flex row (`h-screen`, `overflow-hidden`).
