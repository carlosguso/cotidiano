import { eq } from 'drizzle-orm';
import type {
  CreateProjectInput,
  Project,
  ProjectColor,
  ProjectStatus,
  UpdateProjectInput,
} from '../../../shared/types/project';
import type { AppDatabase } from '../client';
import { projects } from '../schema';

type ProjectRow = typeof projects.$inferSelect;

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    identifier: row.identifier,
    description: row.description,
    color: row.color as ProjectColor,
    status: row.status as ProjectStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function listProjects(db: AppDatabase): Project[] {
  return db.select().from(projects).all().map(toProject);
}

export function createProject(db: AppDatabase, input: CreateProjectInput): Project {
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

  db.insert(projects)
    .values({
      id: project.id,
      name: project.name,
      identifier: project.identifier,
      description: project.description,
      color: project.color,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })
    .run();

  return project;
}

export function updateProject(
  db: AppDatabase,
  projectId: string,
  input: UpdateProjectInput,
): Project {
  const existing = db.select().from(projects).where(eq(projects.id, projectId)).get();

  if (!existing) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const updated: Project = {
    ...toProject(existing),
    ...input,
    name: input.name?.trim() ?? existing.name,
    identifier: input.identifier?.trim().toUpperCase() ?? existing.identifier,
    description: input.description?.trim() ?? existing.description,
    updatedAt: now(),
  };

  db.update(projects)
    .set({
      name: updated.name,
      identifier: updated.identifier,
      description: updated.description,
      color: updated.color,
      status: updated.status,
      updatedAt: updated.updatedAt,
    })
    .where(eq(projects.id, projectId))
    .run();

  return updated;
}

export function deleteProject(db: AppDatabase, projectId: string): void {
  const result = db.delete(projects).where(eq(projects.id, projectId)).run();

  if (result.changes === 0) {
    throw new Error(`Project not found: ${projectId}`);
  }
}
