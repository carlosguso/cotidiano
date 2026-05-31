# Cotidiano

A desktop app built with [Electron](https://www.electronjs.org/).

## Project structure

```
cotidiano/
├── src/
│   ├── main.js      # Main process (app lifecycle, windows)
│   └── preload.js   # Secure bridge to the renderer
└── renderer/
    ├── index.html
    ├── styles.css
    └── renderer.js  # UI logic
```

## Development

```bash
npm install
npm start
```

## Security

- `contextIsolation` is enabled
- `nodeIntegration` is disabled in the renderer
- The preload script exposes only explicit APIs via `contextBridge`
