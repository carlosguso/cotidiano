import type { Project } from '@renderer/types/project';
import { PROJECT_COLOR_CLASSES } from '@renderer/lib/projectColors';

type ProjectIconProps = {
  project: Pick<Project, 'name' | 'color'>;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'size-5 text-[10px]',
  md: 'size-6 text-xs',
  lg: 'size-8 text-sm',
};

export function ProjectIcon({ project, size = 'md' }: ProjectIconProps) {
  const colors = PROJECT_COLOR_CLASSES[project.color];
  const initial = project.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-semibold ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
    >
      {initial}
    </span>
  );
}
