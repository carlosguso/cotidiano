import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectsProvider, useProjects } from '@renderer/context/ProjectsContext';
import { createMockProject } from '@renderer/test/fixtures/projects';
import { installInMemoryElectronAPI } from '@renderer/test/in-memory-electron-api';

describe('ProjectsContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useProjects())).toThrow(
      'useProjects must be used within a ProjectsProvider',
    );
  });

  it('creates a project and selects it', async () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: ProjectsProvider,
    });

    await act(async () => {
      await result.current.createProject({
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

  it('updates a project', async () => {
    const project = createMockProject();
    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[project]} initialSelectedProjectId={project.id}>
          {children}
        </ProjectsProvider>
      ),
    });

    await act(async () => {
      await result.current.updateProject(project.id, {
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

  it('deletes a project and clears selection', async () => {
    const project = createMockProject();
    const { result } = renderHook(() => useProjects(), {
      wrapper: ({ children }) => (
        <ProjectsProvider initialProjects={[project]} initialSelectedProjectId={project.id}>
          {children}
        </ProjectsProvider>
      ),
    });

    await act(async () => {
      await result.current.deleteProject(project.id);
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

  it('loads projects from the database API on mount', async () => {
    const stored = createMockProject({ id: 'stored-1', name: 'Stored Project' });
    installInMemoryElectronAPI({ projects: [stored] });

    const { result } = renderHook(() => useProjects(), {
      wrapper: ProjectsProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projects).toEqual([stored]);
  });

  it('persists create, update, and delete through the database API', async () => {
    installInMemoryElectronAPI();

    const { result } = renderHook(() => useProjects(), {
      wrapper: ProjectsProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createProject({
        name: 'API Project',
        identifier: 'api',
      });
    });

    const projectId = result.current.projects[0].id;

    await act(async () => {
      await result.current.updateProject(projectId, { name: 'Renamed API Project' });
    });

    expect(result.current.projects[0].name).toBe('Renamed API Project');

    const listed = await window.electronAPI.projects.list();
    expect(listed).toHaveLength(1);
    expect(listed[0].name).toBe('Renamed API Project');

    await act(async () => {
      await result.current.deleteProject(projectId);
    });

    expect(result.current.projects).toHaveLength(0);
    expect(await window.electronAPI.projects.list()).toHaveLength(0);
  });
});
