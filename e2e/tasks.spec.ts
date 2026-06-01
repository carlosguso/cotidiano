import { test, expect } from './fixtures/electron-app';
import { createProject } from './helpers/projects';
import {
  createTask,
  openDocumentsTab,
  openMoreTaskActions,
  openOverviewTab,
  openTaskActions,
  openTasksTab,
  setupProjectWithTasksTab,
  tasksImportFixturePath,
} from './helpers/tasks';

test.describe('Project detail tabs', () => {
  test.beforeEach(async ({ window }) => {
    await createProject(window, {
      name: 'Tabbed Project',
      identifier: 'TAB',
      description: 'Overview description text',
    });
  });

  test('shows overview content by default', async ({ window }) => {
    await expect(window.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    await expect(window.getByRole('heading', { name: 'Description' })).toBeVisible();
    await expect(window.getByText('Overview description text')).toBeVisible();
    await expect(window.getByText('Created')).toBeVisible();
    await expect(window.getByText('Updated')).toBeVisible();
    await expect(window.getByRole('button', { name: 'Add task' })).toHaveCount(0);
  });

  test('switches to the tasks tab', async ({ window }) => {
    await openTasksTab(window);

    await expect(window.getByRole('tab', { name: 'Tasks' })).toHaveAttribute('aria-selected', 'true');
    await expect(window.getByRole('button', { name: 'Add task' })).toBeVisible();
    await expect(window.getByRole('heading', { name: 'To do' })).toBeVisible();
    await expect(window.getByText('Overview description text')).toHaveCount(0);
  });

  test('switches to the documents tab', async ({ window }) => {
    await openDocumentsTab(window);

    await expect(window.getByRole('tab', { name: 'Documents' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(window.getByText('Documents will live inside this project.')).toBeVisible();
    await expect(window.getByRole('button', { name: 'Add task' })).toHaveCount(0);
  });
});

test.describe('Task lifecycle', () => {
  test.beforeEach(async ({ window }) => {
    await setupProjectWithTasksTab(window);
  });

  test('creates a task and shows it in the to do section', async ({ window }) => {
    await createTask(window, {
      title: 'Design homepage',
      description: 'Wireframe the hero section',
    });

    const todoSection = window.getByRole('region', { name: 'To do' });
    await expect(todoSection.getByText('Design homepage')).toBeVisible();
    await expect(todoSection.getByText('Wireframe the hero section')).toBeVisible();
  });

  test('creates a task with tags', async ({ window }) => {
    await createTask(window, {
      title: 'Write copy',
      tags: ['copy', 'marketing'],
    });

    const todoSection = window.getByRole('region', { name: 'To do' });
    await expect(todoSection.getByText('copy', { exact: true })).toBeVisible();
    await expect(todoSection.getByText('marketing', { exact: true })).toBeVisible();
  });

  test('edits a task from the actions menu', async ({ window }) => {
    await createTask(window, { title: 'Initial task' });

    await openTaskActions(window, 'Initial task');
    await window.getByRole('menuitem', { name: 'Edit' }).click();

    const dialog = window.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Edit task' })).toBeVisible();
    await dialog.getByLabel('Title').fill('Updated task');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(window.getByText('Updated task')).toBeVisible();
    await expect(window.getByText('Initial task')).toHaveCount(0);
  });

  test('changes task status from the row menu', async ({ window }) => {
    await createTask(window, { title: 'Status task' });

    const todoSection = window.getByRole('region', { name: 'To do' });
    await expect(todoSection.getByText('Status task')).toBeVisible();

    await window.getByRole('button', { name: 'Change status for Status task' }).click();
    await window.getByRole('menuitem', { name: 'In progress' }).click();

    const inProgressSection = window.getByRole('region', { name: 'In progress' });
    await expect(inProgressSection.getByText('Status task')).toBeVisible();
    await expect(todoSection.getByText('Status task')).toHaveCount(0);
  });

  test('archives a task after confirmation', async ({ window }) => {
    await createTask(window, { title: 'Archive me' });

    const todoSection = window.getByRole('region', { name: 'To do' });
    await expect(todoSection.getByText('Archive me')).toBeVisible();

    await openTaskActions(window, 'Archive me');
    await window.getByRole('menuitem', { name: 'Archive' }).click();

    const dialog = window.getByRole('alertdialog');
    await expect(dialog.getByText('Archive Archive me?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Archive task' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(todoSection.getByText('Archive me')).toHaveCount(0);
    await expect(window.getByRole('region', { name: 'Archived' })).toHaveCount(0);
  });

  test('deletes a task after confirmation', async ({ window }) => {
    await createTask(window, { title: 'Delete me' });

    await openTaskActions(window, 'Delete me');
    await window.getByRole('menuitem', { name: 'Delete' }).click();

    const dialog = window.getByRole('alertdialog');
    await expect(dialog.getByText('Delete Delete me?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete task' }).click();
    await dialog.waitFor({ state: 'hidden' });

    await expect(window.getByText('Delete me')).toHaveCount(0);
  });
});

test.describe('Task import', () => {
  test.beforeEach(async ({ window }) => {
    await setupProjectWithTasksTab(window);
  });

  test('imports tasks from a JSON file', async ({ window }) => {
    await openMoreTaskActions(window);
    await window.getByRole('menuitem', { name: 'Import tasks' }).click();

    const dialog = window.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Import tasks' })).toBeVisible();

    await dialog.getByLabel('Choose tasks JSON file').setInputFiles(tasksImportFixturePath);
    await expect(dialog.getByText(/3 tasks ready to import/)).toBeVisible();

    await dialog.getByRole('button', { name: 'Import tasks', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });

    const todoSection = window.getByRole('region', { name: 'To do' });
    const inProgressSection = window.getByRole('region', { name: 'In progress' });
    const doneSection = window.getByRole('region', { name: 'Done' });

    await expect(todoSection.getByText('Set up analytics')).toBeVisible();
    await expect(inProgressSection.getByText('Review homepage copy')).toBeVisible();
    await expect(doneSection.getByText('Ship launch checklist')).toBeVisible();
    await expect(todoSection.getByText('analytics', { exact: true })).toBeVisible();
  });

  test('shows an error for invalid JSON files', async ({ window }) => {
    await openMoreTaskActions(window);
    await window.getByRole('menuitem', { name: 'Import tasks' }).click();

    const dialog = window.getByRole('dialog');

    await dialog.getByLabel('Choose tasks JSON file').setInputFiles({
      name: 'invalid-tasks.json',
      mimeType: 'application/json',
      buffer: Buffer.from('not json'),
    });

    await expect(dialog.getByText('File must be valid JSON.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Import tasks', exact: true })).toBeDisabled();
  });
});
