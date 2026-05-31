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
    expect(screen.getByText('A marketing website project')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
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
