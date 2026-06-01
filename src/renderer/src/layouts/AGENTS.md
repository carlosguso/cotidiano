# Layouts

`AppLayout.tsx` — top-level shell after providers:

- Flex row: `Sidebar` | `ProjectDetail`
- Local state: `createModalOpen` for global "new project" `ProjectModal`

No routing library yet — selection is entirely `ProjectsContext.selectedProjectId`.

When adding new top-level regions (e.g. settings), extend this layout or introduce a router here rather than in `App.tsx`.
