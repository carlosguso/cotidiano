import { ListTodo } from 'lucide-react';
import type { TodoList } from '@renderer/types/todo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TodoListListItemProps = {
  todoList: TodoList;
  selected: boolean;
  collapsed?: boolean;
  onSelect: (todoListId: string) => void;
};

export function TodoListListItem({
  todoList,
  selected,
  collapsed = false,
  onSelect,
}: TodoListListItemProps) {
  if (collapsed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={todoList.name}
        title={todoList.name}
        onClick={() => onSelect(todoList.id)}
        className={cn('w-full', selected && 'bg-accent text-accent-foreground')}
      >
        <ListTodo aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(todoList.id)}
      className={cn(
        'h-auto w-full justify-start gap-2.5 px-2 py-1.5 font-normal',
        selected && 'bg-accent text-accent-foreground',
      )}
    >
      <ListTodo aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-left text-sm">{todoList.name}</span>
    </Button>
  );
}
