export type ProjectStatus = 'active' | 'archived';

export type ProjectColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink';

export type Project = {
  id: string;
  name: string;
  identifier: string;
  description: string;
  color: ProjectColor;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  identifier: string;
  description?: string;
  color?: ProjectColor;
};

export type UpdateProjectInput = Partial<
  Pick<Project, 'name' | 'identifier' | 'description' | 'color' | 'status'>
>;
