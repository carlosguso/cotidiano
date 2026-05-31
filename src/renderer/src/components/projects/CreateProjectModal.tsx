import { useEffect, useState, type FormEvent } from 'react';
import type { ProjectColor } from '@renderer/types/project';
import { useProjects } from '@renderer/context/ProjectsContext';
import {
  PROJECT_COLOR_CLASSES,
  PROJECT_COLORS,
  suggestIdentifier,
} from '@renderer/lib/projectColors';
import { Button } from '@renderer/components/ui/Button';
import { Input } from '@renderer/components/ui/Input';
import { Textarea } from '@renderer/components/ui/Textarea';
import { Modal } from '@renderer/components/ui/Modal';

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const { createProject, activeProjects } = useProjects();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<ProjectColor>('blue');
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setIdentifier('');
    setDescription('');
    setColor('blue');
    setIdentifierTouched(false);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!identifierTouched) {
      setIdentifier(suggestIdentifier(name));
    }
  }, [name, identifierTouched]);

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
      (project) => project.identifier === trimmedIdentifier,
    );

    if (identifierTaken) {
      setError('That identifier is already in use.');
      return;
    }

    createProject({
      name: trimmedName,
      identifier: trimmedIdentifier,
      description,
      color,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create project"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="create-project-form">
            Create project
          </Button>
        </>
      }
    >
      <form id="create-project-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          autoFocus
          label="Name"
          placeholder="Marketing site"
          value={name}
          onChange={(event) => {
            setError(null);
            setName(event.target.value);
          }}
        />

        <Input
          label="Identifier"
          hint="Short key used in references, e.g. MKT"
          value={identifier}
          onChange={(event) => {
            setError(null);
            setIdentifierTouched(true);
            setIdentifier(event.target.value.toUpperCase());
          }}
          error={error ?? undefined}
        />

        <Textarea
          label="Description"
          placeholder="What is this project about?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Color</span>
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
                    selected ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${colors.ring}` : ''
                  }`}
                />
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
