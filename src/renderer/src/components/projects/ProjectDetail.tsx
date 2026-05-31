import { useEffect, useState } from 'react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';
import { ProjectModal } from '@renderer/components/projects/ProjectModal';
import { DropdownMenu, MoreVerticalIcon } from '@renderer/components/ui/DropdownMenu';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ProjectDetail() {
  const { selectedProject, updateProject, deleteProject, selectProject } = useProjects();
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    setEditModalOpen(false);
  }, [selectedProject?.id]);

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
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  {selectedProject.name}
                </h1>
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

          <DropdownMenu
            align="end"
            ariaLabel="Project actions"
            trigger={<MoreVerticalIcon />}
            items={[
              { label: 'Edit', onClick: () => setEditModalOpen(true) },
              { label: 'Archive', onClick: handleArchive },
              { label: 'Delete', onClick: handleDelete, destructive: true },
            ]}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {selectedProject.description ? (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-300">Description</h2>
              <p className="text-sm leading-relaxed text-zinc-400">{selectedProject.description}</p>
            </section>
          ) : null}

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

      <ProjectModal
        project={selectedProject}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
}
