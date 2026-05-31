import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectListItem } from '@renderer/components/projects/ProjectListItem';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('ProjectListItem', () => {
  it('renders the project name and identifier', () => {
    const project = createMockProject();
    renderWithProviders(
      <ProjectListItem project={project} selected={false} onSelect={vi.fn()} />,
    );

    expect(screen.getByText('Marketing Site')).toBeInTheDocument();
    expect(screen.getByText('MKT')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const project = createMockProject();
    const onSelect = vi.fn();
    const { user } = renderWithProviders(
      <ProjectListItem project={project} selected={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: /Marketing Site/ }));

    expect(onSelect).toHaveBeenCalledWith('project-1');
  });

  it('shows only the icon when collapsed', () => {
    const project = createMockProject();
    renderWithProviders(
      <ProjectListItem
        project={project}
        selected={false}
        collapsed
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByText('Marketing Site')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marketing Site' })).toBeInTheDocument();
  });
});
