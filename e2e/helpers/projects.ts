import type { Page } from '@playwright/test';

export async function createProject(
  window: Page,
  {
    name,
    identifier,
    description = '',
  }: {
    name: string;
    identifier: string;
    description?: string;
  },
) {
  await window.getByRole('button', { name: 'Create project', exact: true }).click();
  const dialog = window.getByRole('dialog');
  await dialog.getByLabel('Name').fill(name);
  await dialog.getByLabel('Identifier').fill(identifier);

  if (description) {
    await dialog.getByLabel('Description').fill(description);
  }

  await dialog.getByRole('button', { name: 'Create project' }).click();
  await dialog.waitFor({ state: 'hidden' });
}

export async function openProjectActions(window: Page) {
  await window.getByRole('button', { name: 'Project actions' }).click();
}

export async function selectProjectInSidebar(window: Page, name: string) {
  await window.getByRole('button', { name: new RegExp(name) }).click();
}
