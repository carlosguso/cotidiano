import type { Project } from '@renderer/types/project';

export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'Marketing Site',
    identifier: 'MKT',
    description: 'A marketing website project',
    color: 'blue',
    status: 'active',
    createdAt: '2024-06-01T12:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
    ...overrides,
  };
}
