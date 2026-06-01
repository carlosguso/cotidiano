import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TodoListDetail } from '@renderer/components/todos/TodoListDetail';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { createMockTodoItem, createMockTodoList } from '@renderer/test/fixtures/todos';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('TodoListDetail', () => {
  it('renders nothing when no todo list is selected', () => {
    const { container } = renderWithProviders(<TodoListDetail />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows items and supports completing a misc item', async () => {
    const list = createMockTodoList();
    const misc = createMockTodoItem({ id: 'item-misc', title: 'Buy coffee' });
    const task = createMockTask({
      id: 'task-1',
      projectId: 'project-1',
      title: 'Ship feature',
    });
    const linked = createMockTodoItem({
      id: 'item-linked',
      taskId: 'task-1',
      title: 'Ship feature',
      position: 1,
      task,
    });

    const { user } = renderWithProviders(<TodoListDetail />, {
      initialSelectedTodoListId: list.id,
      initialTodoLists: [list],
      initialTodoItems: [misc, linked],
      initialTasks: [task],
    });

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('Buy coffee')).toBeInTheDocument();
    expect(screen.getByText('Ship feature')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark Buy coffee complete' }));

    const completedSection = screen.getByRole('list', { name: 'Completed items' });
    expect(within(completedSection).getByText('Buy coffee')).toBeInTheDocument();
  });
});
