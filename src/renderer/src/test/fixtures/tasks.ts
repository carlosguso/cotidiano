import type { Task } from '@renderer/types/task';

export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Write landing page copy',
    description: 'Draft hero and feature sections',
    status: 'todo',
    tags: [],
    archived: false,
    createdAt: '2024-06-01T12:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
    ...overrides,
  };
}
