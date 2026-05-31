import type { Project } from '@renderer/types/project';
import { ProjectIcon } from '@renderer/components/projects/ProjectIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={project.name}
        onClick={() => onSelect(project.id)}
        className={cn('w-full', selected && 'bg-accent text-accent-foreground')}
      >
        <ProjectIcon project={project} size="sm" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(project.id)}
      className={cn(
        'group h-auto w-full justify-start gap-2.5 px-2 py-1.5 font-normal',
        selected && 'bg-accent text-accent-foreground',
      )}
    >
      <ProjectIcon project={project} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm text-left">{project.name}</span>
      <span className="shrink-0 text-[11px] font-medium tracking-wide text-muted-foreground group-hover:text-muted-foreground">
        {project.identifier}
      </span>
    </Button>
  );
}
