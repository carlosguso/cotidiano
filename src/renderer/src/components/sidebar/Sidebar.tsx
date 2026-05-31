import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { ProjectListItem } from '@renderer/components/projects/ProjectListItem';
import { Button } from '@renderer/components/ui/Button';

type SidebarProps = {
  onCreateProject: () => void;
};

export function Sidebar({ onCreateProject }: SidebarProps) {
  const { activeProjects, selectedProjectId, selectProject } = useProjects();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200 ease-out ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div
        className={`flex h-12 items-center border-b border-zinc-800 ${
          collapsed ? 'justify-center px-2' : 'px-4'
        }`}
      >
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-950">
            C
          </span>
          {!collapsed ? (
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-100">
              Cotidiano
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={`flex items-center py-3 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-3'
        }`}
      >
        {!collapsed ? (
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Projects
          </span>
        ) : null}
        <Button
          variant="ghost"
          className="size-7 shrink-0 px-0 text-zinc-400 hover:text-zinc-100"
          onClick={onCreateProject}
          aria-label="Create project"
          title="Create project"
        >
          +
        </Button>
      </div>

      <nav
        className={`scrollbar-thin flex-1 space-y-0.5 overflow-y-auto pb-4 ${
          collapsed ? 'px-1.5' : 'px-2'
        }`}
      >
        {activeProjects.length === 0 ? (
          collapsed ? (
            <button
              type="button"
              title="Create your first project"
              onClick={onCreateProject}
              className="flex w-full items-center justify-center rounded-md border border-dashed border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              <span className="text-sm leading-none">+</span>
            </button>
          ) : (
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
          )
        ) : (
          activeProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              selected={project.id === selectedProjectId}
              collapsed={collapsed}
              onSelect={selectProject}
            />
          ))
        )}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex w-full items-center rounded-md py-1.5 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 ${
            collapsed ? 'justify-center' : 'gap-2 px-2'
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose aria-hidden="true" className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </aside>
  );
}
