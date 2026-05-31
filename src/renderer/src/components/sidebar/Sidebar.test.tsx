import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@renderer/components/sidebar/Sidebar';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('Sidebar', () => {
  it('renders the empty state', () => {
    renderWithProviders(<Sidebar onCreateProject={vi.fn()} />);

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create your first project' })).toBeInTheDocument();
  });

  it('renders active projects', () => {
    const project = createMockProject();
    renderWithProviders(<Sidebar onCreateProject={vi.fn()} />, {
      initialProjects: [project],
    });

    expect(screen.getByText('Marketing Site')).toBeInTheDocument();
  });

  it('calls onCreateProject from the header action', async () => {
    const onCreateProject = vi.fn();
    const { user } = renderWithProviders(<Sidebar onCreateProject={onCreateProject} />);

    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(onCreateProject).toHaveBeenCalledOnce();
  });

  it('collapses and expands the sidebar', async () => {
    const project = createMockProject();
    const { user } = renderWithProviders(<Sidebar onCreateProject={vi.fn()} />, {
      initialProjects: [project],
    });

    expect(screen.getByText('Marketing Site')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(screen.queryByText('Marketing Site')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marketing Site' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }));

    expect(screen.getByText('Marketing Site')).toBeInTheDocument();
  });
});
