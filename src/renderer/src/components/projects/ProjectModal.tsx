import { useEffect, useState, type FormEvent } from 'react';
import type { Project, ProjectColor } from '@renderer/types/project';
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

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

const FORM_ID = 'project-form';

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
    <Modal
      open={open && (!isEditing || project !== null)}
      title={isEditing ? 'Edit project' : 'Create project'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID}>
            {isEditing ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit}>
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
