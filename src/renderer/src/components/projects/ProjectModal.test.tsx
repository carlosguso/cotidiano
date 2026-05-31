import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectModal } from '@renderer/components/projects/ProjectModal';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('ProjectModal', () => {
  it('renders the create project form', () => {
    renderWithProviders(<ProjectModal open onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create project' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Identifier')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('auto-suggests an identifier from the project name', async () => {
    const { user } = renderWithProviders(<ProjectModal open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Name'), 'Marketing Site');

    expect(screen.getByLabelText('Identifier')).toHaveValue('MS');
  });

  it('shows validation errors for missing fields', async () => {
    const { user } = renderWithProviders(<ProjectModal open onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(screen.getByText('Project name is required.')).toBeInTheDocument();
  });

  it('creates a project and closes the modal', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<ProjectModal open onClose={onClose} />);

    await user.type(screen.getByLabelText('Name'), 'Marketing Site');
    await user.clear(screen.getByLabelText('Identifier'));
    await user.type(screen.getByLabelText('Identifier'), 'MKT');
    await user.type(screen.getByLabelText('Description'), 'Website refresh');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('prevents duplicate identifiers when creating', async () => {
    const existing = createMockProject({ identifier: 'MKT' });
    const onClose = vi.fn();
    const { user } = renderWithProviders(<ProjectModal open onClose={onClose} />, {
      initialProjects: [existing],
    });

    await user.type(screen.getByLabelText('Name'), 'Another Project');
    await user.clear(screen.getByLabelText('Identifier'));
    await user.type(screen.getByLabelText('Identifier'), 'MKT');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(screen.getByText('That identifier is already in use.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders edit mode with existing project values', () => {
    const project = createMockProject();
    renderWithProviders(<ProjectModal open project={project} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Edit project' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Marketing Site');
    expect(screen.getByLabelText('Identifier')).toHaveValue('MKT');
    expect(screen.getByLabelText('Description')).toHaveValue('A marketing website project');
  });

  it('updates a project in edit mode', async () => {
    const project = createMockProject();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <ProjectModal open project={project} onClose={onClose} />,
      {
        initialProjects: [project],
        initialSelectedProjectId: project.id,
      },
    );

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated Site');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
