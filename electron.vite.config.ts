import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

const migrationsSource = resolve('src/main/db/migrations');
const migrationsTarget = resolve('out/main/migrations');

function copyDatabaseMigrations(): Plugin {
  return {
    name: 'copy-database-migrations',
    closeBundle() {
      if (!existsSync(migrationsSource)) {
        return;
      }

      mkdirSync(migrationsTarget, { recursive: true });
      cpSync(migrationsSource, migrationsTarget, { recursive: true });
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyDatabaseMigrations()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
