import { useEffect, useState } from 'react';
import { ListTodo, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTodos } from '@renderer/context/TodosContext';
import { AddTodoItemModal } from '@renderer/components/todos/AddTodoItemModal';
import { EditTodoItemModal } from '@renderer/components/todos/EditTodoItemModal';
import { TodoItemRow } from '@renderer/components/todos/TodoItemRow';
import { TodoListModal } from '@renderer/components/todos/TodoListModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TodoItemWithTask } from '@renderer/types/todo';

type ConfirmAction = 'deleteList' | 'deleteItem' | null;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function TodoListDetail() {
  const {
    selectedTodoList,
    itemsForList,
    deleteTodoList,
    deleteTodoItem,
    selectTodoList,
    isLoadingItems,
  } = useTodos();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItemWithTask | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [deletingItem, setDeletingItem] = useState<TodoItemWithTask | null>(null);

  useEffect(() => {
    setAddItemOpen(false);
    setEditModalOpen(false);
    setListModalOpen(false);
    setEditingItem(null);
    setConfirmAction(null);
    setDeletingItem(null);
  }, [selectedTodoList?.id]);

  if (!selectedTodoList) {
    return null;
  }

  const items = itemsForList(selectedTodoList.id);
  const pendingItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  const handleDeleteList = async () => {
    await deleteTodoList(selectedTodoList.id);
    selectTodoList(null);
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    await deleteTodoItem(deletingItem.id);
    setDeletingItem(null);
    setConfirmAction(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="border-border px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
              <ListTodo aria-hidden="true" strokeWidth={1.75} className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {selectedTodoList.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Session list mixing project tasks and misc items.
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Todo list actions">
                <MoreVertical aria-hidden="true" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setListModalOpen(true)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmAction('deleteList')}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Items</h2>
              <Button type="button" size="sm" onClick={() => setAddItemOpen(true)}>
                <Plus aria-hidden="true" />
                Add item
              </Button>
            </div>

            {isLoadingItems ? (
              <p className="text-sm text-muted-foreground">Loading items…</p>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add a misc note or pull in tasks from your projects.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingItems.length > 0 ? (
                  <div className="space-y-2" role="list" aria-label="Pending items">
                    {pendingItems.map((item) => (
                      <TodoItemRow
                        key={item.id}
                        item={item}
                        onEdit={(entry) => {
                          setEditingItem(entry);
                          setEditModalOpen(true);
                        }}
                        onDelete={(entry) => {
                          setDeletingItem(entry);
                          setConfirmAction('deleteItem');
                        }}
                      />
                    ))}
                  </div>
                ) : null}

                {completedItems.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Completed
                    </h3>
                    <div role="list" aria-label="Completed items" className="space-y-2">
                      {completedItems.map((item) => (
                        <TodoItemRow
                          key={item.id}
                          item={item}
                          onEdit={(entry) => {
                            setEditingItem(entry);
                            setEditModalOpen(true);
                          }}
                          onDelete={(entry) => {
                            setDeletingItem(entry);
                            setConfirmAction('deleteItem');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="text-foreground">{formatDate(selectedTodoList.createdAt)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="text-foreground">{formatDate(selectedTodoList.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <AddTodoItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        todoListId={selectedTodoList.id}
      />

      <EditTodoItemModal
        open={editModalOpen}
        item={editingItem}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
      />

      <TodoListModal
        todoList={selectedTodoList}
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
      />

      <ConfirmModal
        open={confirmAction === 'deleteList'}
        title={`Delete ${selectedTodoList.name}?`}
        description="This list and all of its items will be permanently removed."
        confirmLabel="Delete list"
        destructive
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDeleteList}
      />

      <ConfirmModal
        open={confirmAction === 'deleteItem'}
        title={deletingItem ? `Remove ${deletingItem.title}?` : 'Remove item?'}
        description="This removes the item from the list. Linked project tasks are not deleted."
        confirmLabel="Remove item"
        destructive
        onClose={() => {
          setConfirmAction(null);
          setDeletingItem(null);
        }}
        onConfirm={handleDeleteItem}
      />
    </div>
  );
}
