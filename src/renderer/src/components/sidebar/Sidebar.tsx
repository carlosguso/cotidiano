import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { ProjectListItem } from '@renderer/components/projects/ProjectListItem';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  onCreateProject: () => void;
};

export function Sidebar({ onCreateProject }: SidebarProps) {
  const { activeProjects, selectedProjectId, selectProject } = useProjects();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      <div
        className={`flex h-12 items-center border-b border-sidebar-border ${
          collapsed ? 'justify-center px-2' : 'px-4'
        }`}
      >
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          {!collapsed ? (
            <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
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
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Projects
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          onClick={onCreateProject}
          aria-label="Create project"
          title="Create project"
        >
          <Plus aria-hidden="true" strokeWidth={1.75} />
        </Button>
      </div>

      <nav
        className={`scrollbar-thin flex-1 space-y-0.5 overflow-y-auto pb-4 ${
          collapsed ? 'px-1.5' : 'px-2'
        }`}
      >
        {activeProjects.length === 0 ? (
          collapsed ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title="Create your first project"
              onClick={onCreateProject}
              className="w-full border-dashed text-muted-foreground"
            >
              <Plus aria-hidden="true" strokeWidth={1.75} />
            </Button>
          ) : (
            <div className="rounded-md border border-dashed border-border px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">No projects yet</p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={onCreateProject}
                className="mt-2 h-auto p-0"
              >
                Create your first project
              </Button>
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

      <div className="border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full text-muted-foreground ${collapsed ? 'px-0' : 'justify-start gap-2 px-2'}`}
          size={collapsed ? 'icon-sm' : 'sm'}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" strokeWidth={1.75} />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" strokeWidth={1.75} />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
