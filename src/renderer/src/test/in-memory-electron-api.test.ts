import { describe, expect, it } from 'vitest';
import { createInMemoryElectronAPI } from '@renderer/test/in-memory-electron-api';
import { createMockProject } from '@renderer/test/fixtures/projects';

describe('createInMemoryElectronAPI', () => {
  it('stores projects and cascades task deletion', async () => {
    const api = createInMemoryElectronAPI({
      projects: [createMockProject({ id: 'project-1' })],
      tasks: [
        {
          id: 'task-1',
          projectId: 'project-1',
          title: 'Task',
          description: '',
          status: 'todo',
          tags: [],
          archived: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });

    expect(await api.tasks.list()).toHaveLength(1);

    await api.projects.delete('project-1');

    expect(await api.projects.list()).toHaveLength(0);
    expect(await api.tasks.list()).toHaveLength(0);
  });

  it('deduplicates tags on create', async () => {
    const api = createInMemoryElectronAPI();
    const task = await api.tasks.create({
      projectId: 'project-1',
      title: 'Tagged',
      tags: ['Design', 'design'],
    });

    expect(task.tags).toEqual(['Design']);
  });
});
