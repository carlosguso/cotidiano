import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskList } from '@renderer/components/tasks/TaskList';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('TaskList', () => {
  it('shows status sections when the project has no tasks', () => {
    const project = createMockProject();
    renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'To do' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getAllByText('No tasks')).toHaveLength(3);
  });

  it('lists tasks grouped by status', () => {
    const project = createMockProject();
    const todoTask = createMockTask({
      id: 'task-todo',
      projectId: project.id,
      title: 'Write landing page copy',
      status: 'todo',
    });
    const inProgressTask = createMockTask({
      id: 'task-progress',
      projectId: project.id,
      title: 'Review wireframes',
      status: 'in_progress',
    });
    const doneTask = createMockTask({
      id: 'task-done',
      projectId: project.id,
      title: 'Kickoff meeting',
      status: 'done',
    });

    renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [todoTask, inProgressTask, doneTask],
    });

    const todoSection = screen.getByRole('region', { name: 'To do' });
    const inProgressSection = screen.getByRole('region', { name: 'In progress' });
    const doneSection = screen.getByRole('region', { name: 'Done' });

    expect(within(todoSection).getByText('Write landing page copy')).toBeInTheDocument();
    expect(within(inProgressSection).getByText('Review wireframes')).toBeInTheDocument();
    expect(within(doneSection).getByText('Kickoff meeting')).toBeInTheDocument();
  });

  it('shows tags on task rows', () => {
    const project = createMockProject();
    const task = createMockTask({
      projectId: project.id,
      tags: ['design', 'copy'],
    });

    renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [task],
    });

    expect(screen.getByText('design')).toBeInTheDocument();
    expect(screen.getByText('copy')).toBeInTheDocument();
  });

  it('changes task status from the row status menu', async () => {
    const project = createMockProject();
    const task = createMockTask({ projectId: project.id, status: 'todo' });
    const { user } = renderWithProviders(<TaskList projectId={project.id} />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
      initialTasks: [task],
    });

    const todoSection = screen.getByRole('region', { name: 'To do' });
    expect(within(todoSection).getByText('Write landing page copy')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Change status for Write landing page copy' }),
    );
    await user.click(screen.getByRole('menuitem', { name: /In progress/ }));

    const inProgressSection = screen.getByRole('region', { name: 'In progress' });
    expect(within(inProgressSection).getByText('Write landing page copy')).toBeInTheDocument();
    expect(within(todoSection).queryByText('Write landing page copy')).not.toBeInTheDocument();
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
      expect(screen.getAllByText('No tasks')).toHaveLength(3);
    });
  });
});
