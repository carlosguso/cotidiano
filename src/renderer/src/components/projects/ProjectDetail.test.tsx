import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectDetail } from '@renderer/components/projects/ProjectDetail';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('ProjectDetail', () => {
  it('shows the empty state when no project is selected', () => {
    renderWithProviders(<ProjectDetail />);

    expect(screen.getByText('Select a project')).toBeInTheDocument();
    expect(
      screen.getByText(/Projects are the home for tasks and documents/),
    ).toBeInTheDocument();
  });

  it('renders project information when selected', () => {
    const project = createMockProject();
    renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    expect(screen.getByRole('heading', { name: 'Marketing Site' })).toBeInTheDocument();
    expect(screen.getByText('MKT')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tasks' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByText('A marketing website project')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
    expect(screen.queryByText('Documents will live inside this project.')).not.toBeInTheDocument();
  });

  it('switches between overview, tasks, and documents tabs', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('tab', { name: 'Tasks' }));
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
    expect(screen.queryByText('A marketing website project')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(screen.getByRole('tab', { name: 'Documents' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
    expect(screen.getByText('Documents will live inside this project.')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByText('A marketing website project')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('opens the edit modal from the actions menu', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'Project actions' }));
    await user.click(screen.getByRole('menuitem', { name: /Edit/ }));

    expect(await screen.findByRole('heading', { name: 'Edit project' })).toBeInTheDocument();
  });

  it('opens the archive confirmation dialog', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'Project actions' }));
    await user.click(screen.getByRole('menuitem', { name: /Archive/ }));

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Archive Marketing Site?')).toBeInTheDocument();
  });

  it('archives a project after confirmation', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'Project actions' }));
    await user.click(screen.getByRole('menuitem', { name: /Archive/ }));
    await user.click(await screen.findByRole('button', { name: 'Archive project' }));

    await waitFor(() => {
      expect(screen.getByText('Select a project')).toBeInTheDocument();
    });
  });

  it('deletes a project after confirmation', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<ProjectDetail />, {
      initialProjects: [project],
      initialSelectedProjectId: project.id,
    });

    await user.click(screen.getByRole('button', { name: 'Project actions' }));
    await user.click(screen.getByRole('menuitem', { name: /Delete/ }));
    await user.click(await screen.findByRole('button', { name: 'Delete project' }));

    await waitFor(() => {
      expect(screen.getByText('Select a project')).toBeInTheDocument();
    });
  });
});
