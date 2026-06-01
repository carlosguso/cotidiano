import { test, expect } from './fixtures/electron-app';
import { createProject } from './helpers/projects';
import { createTask, openTasksTab } from './helpers/tasks';
import {
  addMiscTodoItem,
  createTodoList,
  openTodoList,
} from './helpers/todos';

test.describe('Todo lists', () => {
  test('creates a list with misc and linked items', async ({ window }) => {
    await createProject(window, {
      name: 'Website',
      identifier: 'WEB',
    });

    await openTasksTab(window);
    await createTask(window, { title: 'Design homepage' });

    await createTodoList(window, { name: 'Today' });
    await openTodoList(window, 'Today');

    await expect(window.getByRole('heading', { name: 'Today' })).toBeVisible();

    await addMiscTodoItem(window, { title: 'Review PRs' });
    await expect(window.getByText('Review PRs')).toBeVisible();

    await window.getByRole('button', { name: 'Add item' }).click();
    const dialog = window.getByRole('dialog');
    await dialog.getByRole('tab', { name: 'From project' }).click();

    const projectInput = dialog.getByRole('combobox', { name: 'Project' });
    await projectInput.click();
    await projectInput.fill('Web');
    await dialog.getByRole('option', { name: 'Website' }).click();

    const taskInput = dialog.getByRole('combobox', { name: 'Task' });
    await taskInput.click();
    await taskInput.fill('Design');
    await dialog.getByRole('option', { name: 'Design homepage' }).click();

    await dialog.getByRole('button', { name: 'Add task' }).click();
    await dialog.waitFor({ state: 'hidden' });

    const pendingItems = window.getByRole('list', { name: 'Pending items' });
    await expect(pendingItems.getByText('Design homepage')).toBeVisible();
    await expect(pendingItems.getByText('WEB', { exact: true })).toBeVisible();
  });

  test('completes and removes a misc item', async ({ window }) => {
    await createTodoList(window, { name: 'Session' });
    await openTodoList(window, 'Session');
    await addMiscTodoItem(window, { title: 'Standup notes' });

    await window.getByRole('button', { name: 'Mark Standup notes complete' }).click();
    await expect(window.getByRole('list', { name: 'Completed items' }).getByText('Standup notes')).toBeVisible();

    await window.getByRole('button', { name: 'Actions for Standup notes' }).click();
    await window.getByRole('menuitem', { name: 'Remove' }).click();
    await window.getByRole('button', { name: 'Remove item' }).click();

    await expect(window.getByText('Standup notes')).toHaveCount(0);
  });
});
