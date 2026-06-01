# Shared DTOs

Domain types used by repositories, IPC, preload, and renderer.

| File | Entities |
|------|----------|
| `project.ts` | `Project`, `ProjectStatus`, `ProjectColor`, `CreateProjectInput`, `UpdateProjectInput` |
| `task.ts` | `Task`, task status union, `CreateTaskInput`, `UpdateTaskInput`, `ImportTaskInput` |
| `tag.ts` | Tag-related types if split from task |

## Conventions

- **IDs**: `string` (UUID)
- **Timestamps**: ISO 8601 strings (`createdAt`, `updatedAt`)
- **Status fields**: string unions or const enums in TypeScript
- **Optional fields** on update inputs use `?` — repositories merge with existing row

When adding fields, update: schema → migration → repository mapping → this type → context/UI.
