import { useProjects } from '@renderer/context/ProjectsContext';
import { ProjectListItem } from '@renderer/components/projects/ProjectListItem';
import { Button } from '@renderer/components/ui/Button';

type SidebarProps = {
  onCreateProject: () => void;
};

export function Sidebar({ onCreateProject }: SidebarProps) {
  const { activeProjects, selectedProjectId, selectProject } = useProjects();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-12 items-center border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-950">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Cotidiano</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-3">
        <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Projects
        </span>
        <Button
          variant="ghost"
          className="size-7 px-0 text-zinc-400 hover:text-zinc-100"
          onClick={onCreateProject}
          aria-label="Create project"
        >
          +
        </Button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {activeProjects.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-800 px-3 py-4 text-center">
            <p className="text-xs text-zinc-500">No projects yet</p>
            <button
              type="button"
              onClick={onCreateProject}
              className="mt-2 text-xs font-medium text-zinc-300 hover:text-zinc-100"
            >
              Create your first project
            </button>
          </div>
        ) : (
          activeProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              selected={project.id === selectedProjectId}
              onSelect={selectProject}
            />
          ))
        )}
      </nav>
    </aside>
  );
}
