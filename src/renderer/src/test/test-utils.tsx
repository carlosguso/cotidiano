import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import { TasksProvider } from '@renderer/context/TasksContext';
import {
  createInMemoryElectronAPI,
  installInMemoryElectronAPI,
} from '@renderer/test/in-memory-electron-api';
import type { Project } from '@renderer/types/project';
import type { Task } from '@renderer/types/task';

type ProviderOptions = {
  /** Seed React state directly (Vitest default — no IPC / database). */
  initialProjects?: Project[];
  initialSelectedProjectId?: string | null;
  initialTasks?: Task[];
  /**
   * Mount providers without seeded state so they load and persist via `window.electronAPI`,
   * using an in-memory implementation of the preload API (mirrors the SQLite repositories).
   */
  useInMemoryElectronAPI?: boolean;
};

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & ProviderOptions;

export function renderWithProviders(ui: ReactElement, options: ExtendedRenderOptions = {}) {
  const {
    initialProjects = [],
    initialSelectedProjectId = null,
    initialTasks = [],
    useInMemoryElectronAPI = false,
    ...renderOptions
  } = options;

  if (useInMemoryElectronAPI) {
    installInMemoryElectronAPI({ projects: initialProjects, tasks: initialTasks });
  }

  const projectsSeed = useInMemoryElectronAPI ? [] : initialProjects;
  const tasksSeed = useInMemoryElectronAPI ? [] : initialTasks;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ProjectsProvider
        initialProjects={projectsSeed}
        initialSelectedProjectId={initialSelectedProjectId}
      >
        <TasksProvider initialTasks={tasksSeed}>{children}</TasksProvider>
      </ProjectsProvider>
    );
  }

  return {
    user: userEvent.setup(),
    electronAPI: useInMemoryElectronAPI ? window.electronAPI : undefined,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export { createInMemoryElectronAPI, installInMemoryElectronAPI };
