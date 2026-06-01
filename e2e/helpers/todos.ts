import type { Page } from '@playwright/test';

export async function createTodoList(
  window: Page,
  input: {
    name: string;
  },
): Promise<void> {
  await window.getByRole('button', { name: 'Create todo list' }).click();

  const dialog = window.getByRole('dialog');
  await dialog.getByLabel('Name').fill(input.name);
  await dialog.getByRole('button', { name: 'Create list' }).click();
  await dialog.waitFor({ state: 'hidden' });
}

export async function openTodoList(window: Page, name: string): Promise<void> {
  await window.getByRole('button', { name, exact: true }).click();
}

export async function addMiscTodoItem(
  window: Page,
  input: {
    title: string;
  },
): Promise<void> {
  await window.getByRole('button', { name: 'Add item' }).click();

  const dialog = window.getByRole('dialog');
  await dialog.getByLabel('Title').fill(input.title);
  await dialog.getByRole('button', { name: 'Add item' }).click();
  await dialog.waitFor({ state: 'hidden' });
}
