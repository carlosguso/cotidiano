import { useRef, useState, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { useTasks } from '@renderer/context/TasksContext';
import { parseTasksImportFile, toCreateTaskInputs, type TaskImportRow } from '@renderer/lib/taskImport';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TaskImportModalProps = {
  open: boolean;
  projectId: string;
  onClose: () => void;
};

export function TaskImportModal({ open, projectId, onClose }: TaskImportModalProps) {
  const { importTasks } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedTasks, setParsedTasks] = useState<TaskImportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setIsDragging(false);
    setFileName(null);
    setParsedTasks(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Only JSON files are supported.');
      setFileName(file.name);
      setParsedTasks(null);
      return;
    }

    const contents = await file.text();
    const result = parseTasksImportFile(contents);

    if ('error' in result) {
      setError(result.error);
      setFileName(file.name);
      setParsedTasks(null);
      return;
    }

    setError(null);
    setFileName(file.name);
    setParsedTasks(result.tasks);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleImport = async () => {
    if (!parsedTasks || parsedTasks.length === 0) {
      setError('Choose a JSON file with at least one task to import.');
      return;
    }

    const inputs = toCreateTaskInputs(projectId, parsedTasks).map(
      ({ projectId: _, ...input }) => input,
    );

    try {
      await importTasks(projectId, inputs);
      handleClose();
    } catch {
      setError('Could not import tasks. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a JSON file with an array of tasks. Each task needs a title; description,
            status, and tags are optional.
          </p>

          <div
            role="button"
            tabIndex={0}
            aria-label="Import tasks file drop zone"
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors',
              isDragging
                ? 'border-ring bg-muted/50'
                : 'border-border bg-muted/20 hover:bg-muted/35',
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag and drop a JSON file here
              </p>
              <p className="text-xs text-muted-foreground">or click to choose from your computer</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              aria-label="Choose tasks JSON file"
              onChange={handleFileChange}
            />
          </div>

          {fileName ? (
            <p className="text-sm text-foreground">
              Selected file: <span className="font-medium">{fileName}</span>
              {parsedTasks && parsedTasks.length > 0 ? (
                <span className="text-muted-foreground">{` (${parsedTasks.length} tasks ready to import)`}</span>
              ) : null}
            </p>
          ) : null}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!parsedTasks || parsedTasks.length === 0}
          >
            Import tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
