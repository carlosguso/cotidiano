# Cotidiano

A desktop app built with [Electron](https://www.electronjs.org/), [React](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/), powered by [electron-vite](https://electron-vite.org/).

## Project structure

```
cotidiano/
├── src/
│   ├── main/           # Main process (app lifecycle, windows)
│   ├── preload/        # Secure bridge to the renderer
│   └── renderer/       # React UI (Vite)
│       ├── index.html
│       └── src/
│           ├── App.tsx
│           └── main.tsx
├── electron.vite.config.ts
└── tsconfig*.json
```

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
| `npm run typecheck` | Run TypeScript checks |

## Security

- `contextIsolation` is enabled
- `nodeIntegration` is disabled in the renderer
- The preload script exposes only explicit APIs via `contextBridge`
