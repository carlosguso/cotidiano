import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTodos } from '@renderer/context/TodosContext';
import { TodoListModal } from '@renderer/components/todos/TodoListModal';
import { createMockTodoList } from '@renderer/test/fixtures/todos';
import { renderWithProviders } from '@renderer/test/test-utils';

function TodoListNames() {
  const { todoLists } = useTodos();
  return <div data-testid="todo-list-names">{todoLists.map((list) => list.name).join(',')}</div>;
}

describe('TodoListModal', () => {
  it('creates a todo list', async () => {
    const { user } = renderWithProviders(
      <>
        <TodoListNames />
        <TodoListModal open onClose={() => undefined} />
      </>,
    );

    await user.type(screen.getByLabelText('Name'), 'Today');
    await user.click(screen.getByRole('button', { name: 'Create list' }));

    expect(screen.getByTestId('todo-list-names')).toHaveTextContent('Today');
  });

  it('edits a todo list', async () => {
    const list = createMockTodoList();

    const { user } = renderWithProviders(
      <>
        <TodoListNames />
        <TodoListModal open todoList={list} onClose={() => undefined} />
      </>,
      { initialTodoLists: [list] },
    );

    const nameInput = screen.getByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Tomorrow');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByTestId('todo-list-names')).toHaveTextContent('Tomorrow');
  });
});
