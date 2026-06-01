import { useEffect, useState, type FormEvent } from 'react';
import type { TodoItemWithTask } from '@renderer/types/todo';
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

type EditTodoItemModalProps = {
  open: boolean;
  onClose: () => void;
  item: TodoItemWithTask | null;
};

export function EditTodoItemModal({ open, onClose, item }: EditTodoItemModalProps) {
  const { updateTodoItem } = useTodos();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;

    setTitle(item.title);
    setError(null);
  }, [open, item]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!item) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Item title is required.');
      return;
    }

    await updateTodoItem(item.id, { title: trimmedTitle });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-todo-item-title">Title</Label>
              <Input
                id="edit-todo-item-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
