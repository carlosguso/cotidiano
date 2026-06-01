import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

const projectRoot = join(__dirname, '../..');
const mainScript = join(projectRoot, 'out/main/index.js');

function launchEnv(dbPath: string): NodeJS.ProcessEnv {
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    COTIDIANO_DB_PATH: dbPath,
  };
  // Cursor/IDE shells set this; Electron then rejects Playwright's debug flags.
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

export const test = base.extend<{
  electronApp: ElectronApplication;
  window: Page;
  dbTempDir: string;
}>({
  dbTempDir: async ({}, use) => {
    const tempDir = mkdtempSync(join(tmpdir(), 'cotidiano-e2e-'));
    await use(tempDir);
    rmSync(tempDir, { recursive: true, force: true });
  },
  electronApp: async ({ dbTempDir }, use) => {
    const dbPath = join(dbTempDir, 'cotidiano.db');
    const electronApp = await electron.launch({
      args: [mainScript],
      cwd: projectRoot,
      env: launchEnv(dbPath),
    });

    await use(electronApp);
    await electronApp.close();
  },
  window: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await use(window);
  },
});

export { expect } from '@playwright/test';
