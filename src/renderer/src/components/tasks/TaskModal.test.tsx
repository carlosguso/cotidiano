import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskModal } from '@renderer/components/tasks/TaskModal';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('TaskModal', () => {
  it('renders the create task form', () => {
    renderWithProviders(<TaskModal open projectId="project-1" onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('shows validation errors for missing title', async () => {
    const { user } = renderWithProviders(
      <TaskModal open projectId="project-1" onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(screen.getByText('Task title is required.')).toBeInTheDocument();
  });

  it('creates a task and closes the modal', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <TaskModal open projectId="project-1" onClose={onClose} />,
    );

    await user.type(screen.getByLabelText('Title'), 'Design homepage');
    await user.type(screen.getByLabelText('Description'), 'Wireframe the hero section');
    await user.selectOptions(screen.getByLabelText('Status'), 'in_progress');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('renders edit mode with existing task values', () => {
    const task = createMockTask({ status: 'in_progress' });
    renderWithProviders(<TaskModal open task={task} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Edit task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Write landing page copy');
    expect(screen.getByLabelText('Description')).toHaveValue('Draft hero and feature sections');
    expect(screen.getByLabelText('Status')).toHaveValue('in_progress');
  });

  it('updates a task in edit mode', async () => {
    const task = createMockTask();
    const onClose = vi.fn();
    const { user } = renderWithProviders(<TaskModal open task={task} onClose={onClose} />, {
      initialTasks: [task],
    });

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated task');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
