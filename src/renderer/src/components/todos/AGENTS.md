# Todo lists (session lists)

Work-session lists that mix **misc items** (not tied to a project) and **references** to existing project tasks.

## Data model

- `todo_lists` — named lists (sidebar)
- `todo_items` — entries with optional `task_id` FK; misc items use `title` only

`completed` on items is independent of linked task status (session checklist vs project workflow).

## UI

| Component | Role |
|-----------|------|
| `TodoListListItem` | Sidebar entry |
| `TodoListModal` | Create / edit list |
| `TodoListDetail` | Main pane when a list is selected |
| `TodoItemRow` | Checkbox, title, project badge for linked tasks |
| `AddTodoItemModal` | Misc tab + searchable project/task pickers (`SearchableSelect`) |
| `EditTodoItemModal` | Edit misc item title only |

Navigation: selecting a project clears the selected todo list and vice versa (`AppLayout`).

## State

`TodosContext` — mirrors `ProjectsContext` / `TasksContext`; requires `TasksProvider` for in-memory task linking.
