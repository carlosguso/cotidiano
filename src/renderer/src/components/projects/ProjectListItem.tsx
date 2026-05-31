import type { Project } from '@renderer/types/project';
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';

type ProjectListItemProps = {
  project: Project;
  selected: boolean;
  collapsed?: boolean;
  onSelect: (projectId: string) => void;
};

export function ProjectListItem({
  project,
  selected,
  collapsed = false,
  onSelect,
}: ProjectListItemProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        title={project.name}
        onClick={() => onSelect(project.id)}
        className={`flex w-full items-center justify-center rounded-md p-1.5 transition-colors ${
          selected
            ? 'bg-zinc-800 text-zinc-100'
            : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
        }`}
      >
        <ProjectIcon project={project} size="sm" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(project.id)}
      className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        selected
          ? 'bg-zinc-800 text-zinc-100'
          : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
      }`}
    >
      <ProjectIcon project={project} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm">{project.name}</span>
      <span className="shrink-0 text-[11px] font-medium tracking-wide text-zinc-500 group-hover:text-zinc-400">
        {project.identifier}
      </span>
    </button>
  );
}
