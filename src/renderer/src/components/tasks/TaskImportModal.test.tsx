import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskImportModal } from '@renderer/components/tasks/TaskImportModal';
import { TaskList } from '@renderer/components/tasks/TaskList';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { renderWithProviders } from '@renderer/test/test-utils';

const fixturePath = join(__dirname, '../../test/fixtures/tasks-import.json');

function createImportFile() {
  const contents = readFileSync(fixturePath, 'utf-8');
  return new File([contents], 'tasks-import.json', { type: 'application/json' });
}

describe('TaskImportModal', () => {
  it('renders the import dialog', () => {
    renderWithProviders(
      <TaskImportModal open projectId="project-1" onClose={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { name: 'Import tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import tasks file drop zone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import tasks' })).toBeDisabled();
  });

  it('imports tasks from a JSON file', async () => {
    const project = createMockProject();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <TaskImportModal open projectId={project.id} onClose={onClose} />,
      {
        initialProjects: [project],
        initialSelectedProjectId: project.id,
      },
    );

    await user.upload(screen.getByLabelText('Choose tasks JSON file'), createImportFile());

    expect(screen.getByText(/tasks-import.json/)).toBeInTheDocument();
    expect(screen.getByText(/3 tasks ready to import/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import tasks' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Import tasks' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('shows an error for invalid JSON files', async () => {
    const { user } = renderWithProviders(
      <TaskImportModal open projectId="project-1" onClose={vi.fn()} />,
    );

    const invalidFile = new File(['not json'], 'tasks.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText('Choose tasks JSON file'), invalidFile);

    expect(screen.getByText('File must be valid JSON.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import tasks' })).toBeDisabled();
  });
});

describe('TaskList import flow', () => {
  it('imports tasks from the actions menu', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'More task actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Import tasks' }));

    expect(screen.getByRole('heading', { name: 'Import tasks' })).toBeInTheDocument();

    await user.upload(screen.getByLabelText('Choose tasks JSON file'), createImportFile());
    await user.click(screen.getByRole('button', { name: 'Import tasks' }));

    await waitFor(() => {
      expect(screen.getByText('Set up analytics')).toBeInTheDocument();
      expect(screen.getByText('Review homepage copy')).toBeInTheDocument();
      expect(screen.getByText('Ship launch checklist')).toBeInTheDocument();
    });

    const todoSection = screen.getByRole('region', { name: 'To do' });
    const inProgressSection = screen.getByRole('region', { name: 'In progress' });
    const doneSection = screen.getByRole('region', { name: 'Done' });

    expect(within(todoSection).getByText('Set up analytics')).toBeInTheDocument();
    expect(within(inProgressSection).getByText('Review homepage copy')).toBeInTheDocument();
    expect(within(doneSection).getByText('Ship launch checklist')).toBeInTheDocument();
  });
});
