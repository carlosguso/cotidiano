import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import { TasksProvider } from '@renderer/context/TasksContext';
import type { Project } from '@renderer/types/project';
import type { Task } from '@renderer/types/task';

type ProviderOptions = {
  initialProjects?: Project[];
  initialSelectedProjectId?: string | null;
  initialTasks?: Task[];
};

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & ProviderOptions;

export function renderWithProviders(ui: ReactElement, options: ExtendedRenderOptions = {}) {
  const {
    initialProjects = [],
    initialSelectedProjectId = null,
    initialTasks = [],
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ProjectsProvider
        initialProjects={initialProjects}
        initialSelectedProjectId={initialSelectedProjectId}
      >
        <TasksProvider initialTasks={initialTasks}>{children}</TasksProvider>
      </ProjectsProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
