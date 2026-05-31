import { test, expect } from './fixtures/electron-app';
import { createProject, openProjectActions } from './helpers/projects';

test.describe('App launch', () => {
  test('shows the initial empty state', async ({ window }) => {
    await expect(window.getByText('Cotidiano')).toBeVisible();
    await expect(window.getByText('Select a project')).toBeVisible();
    await expect(window.getByText('No projects yet')).toBeVisible();
  });
});

test.describe('Project lifecycle', () => {
  test('creates a project and shows it in the sidebar and detail view', async ({ window }) => {
    await createProject(window, {
      name: 'Website Refresh',
      identifier: 'WEB',
      description: 'Main company website',
    });

    await expect(window.getByRole('heading', { name: 'Website Refresh' })).toBeVisible();
    await expect(window.getByText('Main company website')).toBeVisible();
    await expect(window.getByRole('button', { name: /Website Refresh/ })).toBeVisible();
  });

  test('edits a project from the actions menu', async ({ window }) => {
    await createProject(window, {
      name: 'Marketing Site',
      identifier: 'MKT',
    });

    await openProjectActions(window);
    await window.getByRole('menuitem', { name: 'Edit' }).click();

    const dialog = window.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Edit project' })).toBeVisible();

    await dialog.getByLabel('Name').fill('Marketing Platform');
    await dialog.getByLabel('Description').fill('Updated scope');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(window.getByRole('heading', { name: 'Marketing Platform' })).toBeVisible();
    await expect(window.getByText('Updated scope')).toBeVisible();
  });

  test('archives a project after confirmation', async ({ window }) => {
    await createProject(window, {
      name: 'Temporary Project',
      identifier: 'TMP',
    });

    await openProjectActions(window);
    await window.getByRole('menuitem', { name: 'Archive' }).click();

    const dialog = window.getByRole('alertdialog');
    await expect(dialog.getByText('Archive Temporary Project?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Archive project' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(window.getByText('Select a project')).toBeVisible();
    await expect(window.getByText('No projects yet')).toBeVisible();
  });

  test('deletes a project after confirmation', async ({ window }) => {
    await createProject(window, {
      name: 'Delete Me',
      identifier: 'DEL',
    });

    await openProjectActions(window);
    await window.getByRole('menuitem', { name: 'Delete' }).click();

    const dialog = window.getByRole('alertdialog');
    await expect(dialog.getByText('Delete Delete Me?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete project' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(window.getByText('Select a project')).toBeVisible();
    await expect(window.getByRole('button', { name: /Delete Me/ })).toHaveCount(0);
  });
});

test.describe('Sidebar', () => {
  test('collapses and expands', async ({ window }) => {
    await createProject(window, {
      name: 'Sidebar Project',
      identifier: 'SID',
    });

    const sidebar = window.getByRole('navigation');

    await window.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar.getByText('Sidebar Project')).toBeHidden();
    await expect(sidebar.getByRole('button', { name: 'Sidebar Project' })).toBeVisible();

    await window.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(sidebar.getByText('Sidebar Project')).toBeVisible();
  });
});
