import { useEffect, useState } from 'react';
import { Archive, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { useTasks } from '@renderer/context/TasksContext';
import { TaskList } from '@renderer/components/tasks/TaskList';
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';
import { ProjectModal } from '@renderer/components/projects/ProjectModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ConfirmAction = 'archive' | 'delete' | null;
type ProjectTab = 'overview' | 'tasks' | 'documents';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ProjectDetail() {
  const { selectedProject, updateProject, deleteProject, selectProject } = useProjects();
  const { deleteTasksForProject } = useTasks();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview');

  useEffect(() => {
    setEditModalOpen(false);
    setConfirmAction(null);
    setActiveTab('overview');
  }, [selectedProject?.id]);

  if (!selectedProject) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-foreground">Select a project</p>
          <p className="mt-2 text-sm text-muted-foreground">
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
    deleteTasksForProject(selectedProject.id);
    deleteProject(selectedProject.id);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="border-border px-8 py-6 ">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <ProjectIcon project={selectedProject} size="lg" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {selectedProject.name}
                </h1>
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium tracking-wide text-muted-foreground">
                  {selectedProject.identifier}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Project actions">
                <MoreVertical aria-hidden="true" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmAction('archive')}>
                <Archive />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmAction('delete')}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProjectTab)}
        className="flex flex-1 flex-col gap-0"
      >
        <div className="border-b border-border">
          <TabsList
            aria-label="Project views"
            className="h-auto gap-1 rounded-none border-0 bg-transparent p-0"
          >
            <TabsTrigger
              value="overview"
              className="rounded-b-none border border-border border-b-0 bg-muted/45 px-4 py-2 text-sm text-muted-foreground data-[state=active]:-mb-px data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="rounded-b-none border border-border border-b-0 bg-muted/45 px-4 py-2 text-sm text-muted-foreground data-[state=active]:-mb-px data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-b-none border border-border border-b-0 bg-muted/45 px-4 py-2 text-sm text-muted-foreground data-[state=active]:-mb-px data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <TabsContent value="overview" className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-foreground">Description</h2>
                {selectedProject.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedProject.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No description yet.</p>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-medium text-foreground">Details</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-foreground">{formatDate(selectedProject.createdAt)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="text-foreground">{formatDate(selectedProject.updatedAt)}</dd>
                  </div>
                </dl>
              </section>
            </TabsContent>

            <TabsContent value="tasks">
              <TaskList projectId={selectedProject.id} />
            </TabsContent>

            <TabsContent value="documents" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">Documents</h2>
                <span className="text-xs text-muted-foreground">Coming soon</span>
              </div>
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Documents will live inside this project.
                </p>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <ProjectModal
        project={selectedProject}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      <ConfirmModal
        open={confirmAction === 'archive'}
        title={`Archive ${selectedProject.name}?`}
        description="This project will be removed from your sidebar. You can restore archived projects later."
        confirmLabel="Archive project"
        onClose={() => setConfirmAction(null)}
        onConfirm={handleArchive}
      />

      <ConfirmModal
        open={confirmAction === 'delete'}
        title={`Delete ${selectedProject.name}?`}
        description="This action cannot be undone. The project and everything inside it will be permanently removed."
        confirmLabel="Delete project"
        destructive
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
