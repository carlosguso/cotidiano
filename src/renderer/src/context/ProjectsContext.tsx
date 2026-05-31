import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '@renderer/types/project';

type ProjectsContextValue = {
  projects: Project[];
  activeProjects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectProject: (projectId: string | null) => void;
  createProject: (input: CreateProjectInput) => Project;
  updateProject: (projectId: string, input: UpdateProjectInput) => void;
  deleteProject: (projectId: string) => void;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => project.status === 'active')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const selectProject = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId);
  }, []);

  const createProject = useCallback((input: CreateProjectInput): Project => {
    const timestamp = now();
    const project: Project = {
      id: createId(),
      name: input.name.trim(),
      identifier: input.identifier.trim().toUpperCase(),
      description: input.description?.trim() ?? '',
      color: input.color ?? 'blue',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setProjects((current) => [...current, project]);
    setSelectedProjectId(project.id);
    return project;
  }, []);

  const updateProject = useCallback((projectId: string, input: UpdateProjectInput) => {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) return project;

        return {
          ...project,
          ...input,
          name: input.name?.trim() ?? project.name,
          identifier: input.identifier?.trim().toUpperCase() ?? project.identifier,
          description: input.description?.trim() ?? project.description,
          updatedAt: now(),
        };
      }),
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((current) => current.filter((project) => project.id !== projectId));
    setSelectedProjectId((current) => (current === projectId ? null : current));
  }, []);

  const value = useMemo(
    () => ({
      projects,
      activeProjects,
      selectedProjectId,
      selectedProject,
      selectProject,
      createProject,
      updateProject,
      deleteProject,
    }),
    [
      projects,
      activeProjects,
      selectedProjectId,
      selectedProject,
      selectProject,
      createProject,
      updateProject,
      deleteProject,
    ],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
