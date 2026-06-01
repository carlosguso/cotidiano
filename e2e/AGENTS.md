# E2E tests (Playwright + Electron)

Runs against the **built** app (`out/main/index.js`), not the dev server.

## Layout

```
e2e/
├── fixtures/
│   ├── electron-app.ts   # Playwright test fixture (launch app, temp DB)
│   └── tasks-import.json
├── helpers/              # Page-object style helpers
│   ├── projects.ts
│   ├── tasks.ts
│   └── todos.ts
├── projects.spec.ts
├── tasks.spec.ts
└── todos.spec.ts
```

## Fixture behavior (`electron-app.ts`)

- Temp dir per test → `COTIDIANO_DB_PATH` points at isolated SQLite file
- Deletes `ELECTRON_RUN_AS_NODE` from env (breaks Electron launch in IDE shells)
- Provides `electronApp`, `window` (first BrowserWindow)

## Running

```bash
npm run test:e2e      # rebuild native module + build + playwright
npm run test:e2e:ui   # interactive UI mode
```

Requires `npm run build` output present. If launch fails from Cursor terminal, check env vars above.

## Writing specs

- Import `test` / `expect` from `./fixtures/electron-app`, not `@playwright/test` directly
- Prefer helpers in `helpers/` for stable selectors
- Use unique project identifiers per test to avoid collisions if isolation regresses
