import { useEffect, useState } from 'react';
import { useProjects } from '@renderer/context/ProjectsContext';
import {
  PROJECT_COLOR_CLASSES,
  PROJECT_COLORS,
} from '@renderer/lib/projectColors';
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';
import { Button } from '@renderer/components/ui/Button';
import { Textarea } from '@renderer/components/ui/Textarea';
import type { ProjectColor } from '@renderer/types/project';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ProjectDetail() {
  const { selectedProject, updateProject, deleteProject, selectProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!selectedProject) return;
    setName(selectedProject.name);
    setDescription(selectedProject.description);
    setIsDirty(false);
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950">
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-zinc-300">Select a project</p>
          <p className="mt-2 text-sm text-zinc-500">
            Projects are the home for tasks and documents. Choose one from the sidebar or create a
            new project to get started.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateProject(selectedProject.id, {
      name: name.trim() || selectedProject.name,
      description,
    });
    setIsDirty(false);
  };

  const handleColorChange = (color: ProjectColor) => {
    updateProject(selectedProject.id, { color });
  };

  const handleArchive = () => {
    updateProject(selectedProject.id, { status: 'archived' });
    selectProject(null);
  };

  const handleDelete = () => {
    deleteProject(selectedProject.id);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <header className="border-b border-zinc-800 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <ProjectIcon project={selectedProject} size="lg" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full min-w-[12rem] bg-transparent text-2xl font-semibold tracking-tight text-zinc-100 outline-none placeholder:text-zinc-600"
                  placeholder="Project name"
                />
                <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-medium tracking-wide text-zinc-400">
                  {selectedProject.identifier}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                Created {formatDate(selectedProject.createdAt)} · Updated{' '}
                {formatDate(selectedProject.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isDirty ? (
              <Button variant="primary" onClick={handleSave}>
                Save changes
              </Button>
            ) : null}
            <Button variant="secondary" onClick={handleArchive}>
              Archive
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">Description</h2>
              <div className="flex items-center gap-2">
                {PROJECT_COLORS.map((option) => {
                  const colors = PROJECT_COLOR_CLASSES[option];
                  const selected = selectedProject.color === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-label={`Set color to ${option}`}
                      onClick={() => handleColorChange(option)}
                      className={`size-5 rounded-md transition-all ${colors.bg} ${
                        selected ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${colors.ring}` : ''
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <Textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setIsDirty(true);
              }}
              placeholder="Add a short summary for this project..."
              className="min-h-28"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">Tasks</h2>
              <span className="text-xs text-zinc-500">Coming soon</span>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">Tasks will live inside this project.</p>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-300">Documents</h2>
              <span className="text-xs text-zinc-500">Coming soon</span>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">Documents will live inside this project.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
