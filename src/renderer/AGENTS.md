# Renderer package (Vite)

Electron loads `src/renderer/index.html`, which boots `src/renderer/src/main.tsx`.

## Structure

- `index.html` — root mount `#root`
- `src/` — all React application code (see `src/renderer/src/AGENTS.md`)

## Build / dev

- Aliases `@` and `@renderer` → `src/renderer/src` (see `electron.vite.config.ts`)
- Tailwind v4 via `@tailwindcss/vite`
- Global styles: `src/renderer/src/index.css`

## Constraints

- No `fs`, `path`, or `electron` imports — use `window.electronAPI` only
- `nodeIntegration` is off; assume browser APIs + preload bridge
