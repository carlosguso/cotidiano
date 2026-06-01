# Cotidiano

A desktop app built with [Electron](https://www.electronjs.org/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/), powered by [electron-vite](https://electron-vite.org/).

## Tech stack

- **Electron 35** + **electron-vite**
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Radix + New York style, zinc dark theme)
- **Lucide** icons
- **Vitest** + **Testing Library** (unit/integration)
- **Playwright** (E2E against the real Electron app)

## Features

- **Projects** — top-level entity for organizing work (Linear-inspired UI)
  - Create, edit, archive, and delete projects
  - Collapsible sidebar with project list and detail view
  - Unified create/edit modal with identifier suggestion and color picker
  - Confirmation dialogs for destructive actions
- **In-memory state** — project data lives in React context only (persistence not implemented yet)

## AI agent context (`AGENTS.md`)

This repo includes **`AGENTS.md` files** in major directories (start at [`AGENTS.md`](AGENTS.md) in the project root). They describe how each area fits together—architecture, IPC, database, React contexts, tests—so coding agents and live sessions can orient quickly without re-scanning the whole tree.

## Project structure

```
cotidiano/
├── src/
│   ├── main/                    # Main process (app lifecycle, windows)
│   ├── preload/                 # Secure bridge to the renderer
│   └── renderer/src/
│       ├── components/
│       │   ├── projects/        # ProjectModal, ProjectDetail, etc.
│       │   ├── sidebar/         # Sidebar
│       │   └── ui/              # shadcn/ui components
│       ├── context/             # ProjectsContext
│       ├── layouts/             # AppLayout
│       ├── lib/                 # utils, projectColors
│       ├── test/                # Vitest setup, fixtures, helpers
│       └── types/               # Shared TypeScript types
├── e2e/                         # Playwright E2E tests
├── components.json              # shadcn CLI config
├── vitest.config.ts
├── playwright.config.ts
└── electron.vite.config.ts
```

## Path aliases

| Alias | Resolves to |
| --- | --- |
| `@/*` | `src/renderer/src/*` |
| `@renderer/*` | `src/renderer/src/*` |

## Development

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript checks (main + renderer) |
| `npm test` | Run unit/integration tests in watch mode |
| `npm run test:run` | Run unit/integration tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Build and run Playwright E2E tests |
| `npm run test:e2e:ui` | Build and run E2E tests in Playwright UI mode |
| `npm run test:all` | Run unit tests, then E2E tests |

## Testing

### Unit & integration (Vitest)

Tests live alongside source files as `*.test.ts(x)` under `src/renderer/src/`. Coverage targets app code; shadcn UI primitives under `components/ui/` are excluded.

```bash
npm run test:run
npm run test:coverage
```

### E2E (Playwright)

E2E tests launch the **built Electron app** (`out/main/index.js`) and drive the real UI — create/edit/archive/delete projects, sidebar collapse, etc.

```bash
npm run test:e2e
```

E2E requires a production build first (`test:e2e` runs `npm run build` automatically). If tests fail to launch Electron from an IDE terminal, ensure `ELECTRON_RUN_AS_NODE` is not set in the environment.

## Adding shadcn components

`components.json` is configured to write into `src/renderer/src/`. Add new components with:

```bash
npx shadcn@latest add <component>
```

## Security

- `contextIsolation` is enabled
- `nodeIntegration` is disabled in the renderer
- The preload script exposes only explicit APIs via `contextBridge`
