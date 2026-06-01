import { useEffect, useState, type FormEvent } from 'react';
import type { TodoList } from '@renderer/types/todo';
import { useTodos } from '@renderer/context/TodosContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TodoListModalProps = {
  open: boolean;
  onClose: () => void;
  todoList?: TodoList | null;
};

export function TodoListModal({ open, onClose, todoList = null }: TodoListModalProps) {
  const isEditing = todoList !== null;
  const { createTodoList, updateTodoList } = useTodos();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setName(isEditing ? todoList.name : '');
    setError(null);
  }, [open, isEditing, todoList]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('List name is required.');
      return;
    }

    if (isEditing) {
      await updateTodoList(todoList.id, { name: trimmedName });
    } else {
      await createTodoList({ name: trimmedName });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit todo list' : 'Create todo list'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="todo-list-name">Name</Label>
              <Input
                id="todo-list-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Today’s focus"
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Create list'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
