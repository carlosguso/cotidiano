import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskList } from '@renderer/components/tasks/TaskList';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('TaskList', () => {
  it('shows an empty state when the project has no tasks', () => {
    const project = createMockProject();
    renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
  });

  it('lists tasks for the selected project', () => {
    const project = createMockProject();
    const task = createMockTask({ projectId: project.id });
    renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [task],
    });

    expect(screen.getByText('Write landing page copy')).toBeInTheDocument();
    expect(screen.getByText('To do')).toBeInTheDocument();
  });

  it('opens the create task modal', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('heading', { name: 'Create task' })).toBeInTheDocument();
  });

  it('opens the edit task modal from the actions menu', async () => {
    const project = createMockProject();
    const task = createMockTask({ projectId: project.id });
    const { user } = renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [task],
    });

    await user.click(screen.getByRole('button', { name: 'Task actions for Write landing page copy' }));
    await user.click(screen.getByRole('menuitem', { name: /Edit/ }));

    expect(await screen.findByRole('heading', { name: 'Edit task' })).toBeInTheDocument();
  });

  it('deletes a task after confirmation', async () => {
    const project = createMockProject();
    const task = createMockTask({ projectId: project.id });
    const { user } = renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [task],
    });

    await user.click(screen.getByRole('button', { name: 'Task actions for Write landing page copy' }));
    await user.click(screen.getByRole('menuitem', { name: /Delete/ }));
    await user.click(await screen.findByRole('button', { name: 'Delete task' }));

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });
});
