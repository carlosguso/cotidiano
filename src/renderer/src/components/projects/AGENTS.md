# Project UI

Linear-style project management in the main content area + sidebar entries.

| Component | Role |
|-----------|------|
| `ProjectModal` | Create/edit form — identifier suggestion, color picker, archive/delete |
| `ProjectDetail` | Main pane when a project is selected — hosts task list |
| `ProjectListItem` | Sidebar row — icon, name, selection |
| `ProjectIcon` | Colored initials badge from `lib/projectColors` |

## Context usage

- `useProjects()` for selection, CRUD, `selectedProject`
- Deleting a project should call `deleteTasksForProject` from tasks context when cascading is required (check `ProjectModal` / detail flows)

## UX notes

- **Identifier** — uppercased, short code (e.g. `ENG`)
- **Status** — `active` vs archived; sidebar shows `activeProjects` only
- **Colors** — palette from `projectColors.ts`, not free-form hex in UI

## Tests

`ProjectModal.test.tsx`, `ProjectDetail.test.tsx`, `ProjectListItem.test.tsx` — good examples of modal + provider interaction.
