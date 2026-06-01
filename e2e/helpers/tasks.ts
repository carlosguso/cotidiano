import path from 'path';
import type { Page } from '@playwright/test';
import { createProject } from './projects';

export const tasksImportFixturePath = path.join(__dirname, '../fixtures/tasks-import.json');

export async function setupProjectWithTasksTab(
  window: Page,
  project: { name: string; identifier: string; description?: string } = {
    name: 'Task Project',
    identifier: 'TSK',
    description: 'Project for task e2e tests',
  },
) {
  await createProject(window, project);
  await openTasksTab(window);
}

export async function openTasksTab(window: Page) {
  await window.getByRole('tab', { name: 'Tasks' }).click();
}

export async function openOverviewTab(window: Page) {
  await window.getByRole('tab', { name: 'Overview' }).click();
}

export async function openDocumentsTab(window: Page) {
  await window.getByRole('tab', { name: 'Documents' }).click();
}

export async function openMoreTaskActions(window: Page) {
  await window.getByRole('button', { name: 'More task actions' }).click();
}

export async function openTaskActions(window: Page, taskTitle: string) {
  await window.getByRole('button', { name: `Task actions for ${taskTitle}` }).click();
}

export async function createTask(
  window: Page,
  {
    title,
    description = '',
    status,
    tags = [],
  }: {
    title: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    tags?: string[];
  },
) {
  await window.getByRole('button', { name: 'Add task' }).click();

  const dialog = window.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Create task' }).waitFor();
  await dialog.getByLabel('Title').fill(title);

  if (description) {
    await dialog.getByLabel('Description').fill(description);
  }

  if (status) {
    await dialog.getByLabel('Status').selectOption(status);
  }

  for (const tag of tags) {
    await dialog.getByLabel('Tags').fill(tag);
    await dialog.getByLabel('Tags').press('Enter');
  }

  await dialog.getByRole('button', { name: 'Create task' }).click();
  await dialog.waitFor({ state: 'hidden' });
}
