import { test as base, _electron as electron } from '@playwright/test';
import path from 'path';
import type { ElectronApplication, Page } from '@playwright/test';

const projectRoot = path.join(__dirname, '../..');
const mainScript = path.join(projectRoot, 'out/main/index.js');

function launchEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env, NODE_ENV: 'test' };
  // Cursor/IDE shells set this; Electron then rejects Playwright's debug flags.
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

export const test = base.extend<{ electronApp: ElectronApplication; window: Page }>({
  electronApp: async ({}, use) => {
    const electronApp = await electron.launch({
      args: [mainScript],
      cwd: projectRoot,
      env: launchEnv(),
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
