import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import type { Project } from '@renderer/types/project';

type ProjectsProviderOptions = {
  initialProjects?: Project[];
  initialSelectedProjectId?: string | null;
};

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & ProjectsProviderOptions;

export function renderWithProviders(ui: ReactElement, options: ExtendedRenderOptions = {}) {
  const {
    initialProjects = [],
    initialSelectedProjectId = null,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ProjectsProvider
        initialProjects={initialProjects}
        initialSelectedProjectId={initialSelectedProjectId}
      >
        {children}
      </ProjectsProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
