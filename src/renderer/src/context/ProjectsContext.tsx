import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  isLoading: boolean;
  selectProject: (projectId: string | null) => void;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (projectId: string, input: UpdateProjectInput) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function hasProjectsApi(): boolean {
  return typeof window.electronAPI?.projects !== 'undefined';
}

export function ProjectsProvider({
  children,
  initialProjects = [],
  initialSelectedProjectId = null,
}: {
  children: ReactNode;
  initialProjects?: Project[];
  initialSelectedProjectId?: string | null;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialSelectedProjectId,
  );
  const [isLoading, setIsLoading] = useState(
    () => initialProjects.length === 0 && hasProjectsApi(),
  );

  useEffect(() => {
    if (initialProjects.length > 0 || !hasProjectsApi()) {
      return;
    }

    let cancelled = false;

    void window.electronAPI.projects
      .list()
      .then((loaded) => {
        if (!cancelled) {
          setProjects(loaded);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialProjects.length]);

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

  const createProject = useCallback(async (input: CreateProjectInput): Promise<Project> => {
    if (hasProjectsApi()) {
      const project = await window.electronAPI.projects.create(input);
      setProjects((current) => [...current, project]);
      setSelectedProjectId(project.id);
      return project;
    }

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

  const updateProject = useCallback(
    async (projectId: string, input: UpdateProjectInput): Promise<void> => {
      if (hasProjectsApi()) {
        const updated = await window.electronAPI.projects.update(projectId, input);
        setProjects((current) =>
          current.map((project) => (project.id === projectId ? updated : project)),
        );
        return;
      }

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
    },
    [],
  );

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    if (hasProjectsApi()) {
      await window.electronAPI.projects.delete(projectId);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      setSelectedProjectId((current) => (current === projectId ? null : current));
      return;
    }

    setProjects((current) => current.filter((project) => project.id !== projectId));
    setSelectedProjectId((current) => (current === projectId ? null : current));
  }, []);

  const value = useMemo(
    () => ({
      projects,
      activeProjects,
      selectedProjectId,
      selectedProject,
      isLoading,
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
      isLoading,
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
