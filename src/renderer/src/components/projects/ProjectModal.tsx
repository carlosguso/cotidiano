import { useEffect, useState, type FormEvent } from 'react';
import type { Project, ProjectColor } from '@renderer/types/project';
import { useProjects } from '@renderer/context/ProjectsContext';
import {
  PROJECT_COLOR_CLASSES,
  PROJECT_COLORS,
  suggestIdentifier,
} from '@renderer/lib/projectColors';
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
import { Textarea } from '@/components/ui/textarea';

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export function ProjectModal({ open, onClose, project = null }: ProjectModalProps) {
  const isEditing = project !== null;
  const { createProject, updateProject, activeProjects } = useProjects();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ProjectColor>('blue');
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      setName(project.name);
      setIdentifier(project.identifier);
      setDescription(project.description);
      setColor(project.color);
      setIdentifierTouched(true);
    } else {
      setName('');
      setIdentifier('');
      setDescription('');
      setColor('blue');
      setIdentifierTouched(false);
    }

    setError(null);
  }, [open, isEditing, project]);

  useEffect(() => {
    if (!isEditing && !identifierTouched) {
      setIdentifier(suggestIdentifier(name));
    }
  }, [name, identifierTouched, isEditing]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedIdentifier = identifier.trim().toUpperCase();

    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    if (!trimmedIdentifier) {
      setError('Project identifier is required.');
      return;
    }

    const identifierTaken = activeProjects.some(
      (entry) =>
        entry.identifier === trimmedIdentifier && (!isEditing || entry.id !== project.id),
    );

    if (identifierTaken) {
      setError('That identifier is already in use.');
      return;
    }

    if (isEditing) {
      updateProject(project.id, {
        name: trimmedName,
        identifier: trimmedIdentifier,
        description,
        color,
      });
    } else {
      createProject({
        name: trimmedName,
        identifier: trimmedIdentifier,
        description,
        color,
      });
    }

    onClose();
  };

  return (
    <Dialog
      open={open && (!isEditing || project !== null)}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit project' : 'Create project'}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              autoFocus
              placeholder="Marketing site"
              value={name}
              onChange={(event) => {
                setError(null);
                setName(event.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-identifier">Identifier</Label>
            <Input
              id="project-identifier"
              placeholder="MKT"
              value={identifier}
              aria-invalid={error !== null}
              onChange={(event) => {
                setError(null);
                setIdentifierTouched(true);
                setIdentifier(event.target.value.toUpperCase());
              }}
            />
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Short key used in references, e.g. MKT
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((option) => {
                const colors = PROJECT_COLOR_CLASSES[option];
                const selected = color === option;

                return (
                  <button
                    key={option}
                    type="button"
                    aria-label={`Select ${option} color`}
                    onClick={() => setColor(option)}
                    className={`size-7 rounded-md transition-all ${colors.bg} ${
                      selected ? `ring-2 ring-offset-2 ring-offset-background ${colors.ring}` : ''
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save changes' : 'Create project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
