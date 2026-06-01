# shadcn/ui primitives

Generated/configured via `components.json` (New York style, zinc, CSS variables in `index.css`).

## Agent guidance

- **Prefer reuse** over new primitives — check existing exports before `npx shadcn add`
- **Excluded from coverage** — don't add business logic here
- **Naming** — mix of `Button.tsx` and lowercase `dialog.tsx`; match neighboring file when adding
- **Radix** — accessibility and focus trap handled by underlying primitives

## Common pieces

`Button`, `Input`, `Textarea`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Tabs`, `Label`

Feature components compose these; keep domain copy and validation in `projects/` or `tasks/`.
