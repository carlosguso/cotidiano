import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectsProvider, useProjects } from '@renderer/context/ProjectsContext';
import { createMockProject } from '@renderer/test/fixtures/projects';

describe('ProjectsContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useProjects())).toThrow(
      'useProjects must be used within a ProjectsProvider',
    );
  });

  it('creates a project and selects it', () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: ProjectsProvider,
    });

    act(() => {
      result.current.createProject({
        name: 'Marketing Site',
        identifier: 'mkt',
        description: 'Website refresh',
        color: 'green',
      });
    });

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0]).toMatchObject({
      id: 'test-uuid-1',
      name: 'Marketing Site',
      identifier: 'MKT',
      description: 'Website refresh',
      color: 'green',
      status: 'active',
    });
    expect(result.current.selectedProjectId).toBe('test-uuid-1');
    expect(result.current.activeProjects).toHaveLength(1);
  });

  it('updates a project', () => {
    const project = createMockProject();
    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[project]} initialSelectedProjectId={project.id}>
          {children}
        </ProjectsProvider>
      ),
    });

    act(() => {
      result.current.updateProject(project.id, {
        name: 'Updated Name',
        identifier: 'upd',
        description: 'Updated description',
        color: 'purple',
      });
    });

    expect(result.current.projects[0]).toMatchObject({
      name: 'Updated Name',
      identifier: 'UPD',
      description: 'Updated description',
      color: 'purple',
    });
    expect(result.current.projects[0].updatedAt).not.toBe(project.updatedAt);
  });

  it('deletes a project and clears selection', () => {
    const project = createMockProject();
    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[project]} initialSelectedProjectId={project.id}>
          {children}
        </ProjectsProvider>
      ),
    });

    act(() => {
      result.current.deleteProject(project.id);
    });

    expect(result.current.projects).toHaveLength(0);
    expect(result.current.selectedProjectId).toBeNull();
  });

  it('excludes archived projects from activeProjects', () => {
    const active = createMockProject({ id: 'active', name: 'Alpha', identifier: 'A' });
    const archived = createMockProject({
      id: 'archived',
      name: 'Beta',
      identifier: 'B',
      status: 'archived',
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[archived, active]}>
          {children}
        </ProjectsProvider>
      ),
    });

    expect(result.current.activeProjects).toHaveLength(1);
    expect(result.current.activeProjects[0].id).toBe('active');
  });

  it('sorts active projects alphabetically', () => {
    const zebra = createMockProject({ id: 'z', name: 'Zebra', identifier: 'Z' });
    const alpha = createMockProject({ id: 'a', name: 'Alpha', identifier: 'A' });

    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[zebra, alpha]}>{children}</ProjectsProvider>
      ),
    });

    expect(result.current.activeProjects.map((project) => project.name)).toEqual([
      'Alpha',
      'Zebra',
    ]);
  });
});
