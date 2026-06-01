import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AddTodoItemModal } from '@renderer/components/todos/AddTodoItemModal';
import { TodoListDetail } from '@renderer/components/todos/TodoListDetail';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { createMockTask } from '@renderer/test/fixtures/tasks';
import { createMockTodoList } from '@renderer/test/fixtures/todos';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('AddTodoItemModal', () => {
  it('links a task using searchable project and task pickers', async () => {
    const project = createMockProject({ id: 'project-1', name: 'Website', identifier: 'WEB' });
    const task = createMockTask({
      id: 'task-1',
      projectId: project.id,
      title: 'Design homepage',
    });
    const list = createMockTodoList();

    const { user } = renderWithProviders(
      <>
        <TodoListDetail />
        <AddTodoItemModal open onClose={() => undefined} todoListId={list.id} />
      </>,
      {
        initialProjects: [project],
        initialTasks: [task],
        initialTodoLists: [list],
        initialSelectedTodoListId: list.id,
      },
    );

    await user.click(screen.getByRole('tab', { name: 'From project' }));

    const projectInput = screen.getByRole('combobox', { name: 'Project' });
    await user.click(projectInput);
    await user.type(projectInput, 'web');
    const websiteOption = screen.getByRole('option', { name: /Website/ });
    expect(websiteOption).toHaveTextContent('WEB');
    await user.click(websiteOption);

    const taskInput = screen.getByRole('combobox', { name: 'Task' });
    await user.click(taskInput);
    await user.type(taskInput, 'design');
    const taskOption = screen.getByRole('option', { name: /Design homepage/ });
    expect(taskOption).toHaveTextContent('To do');
    await user.click(taskOption);
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Design homepage')).toBeInTheDocument();
  });
});
