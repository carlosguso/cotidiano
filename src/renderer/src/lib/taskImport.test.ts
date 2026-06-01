import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseTasksImportFile, toCreateTaskInputs } from '@renderer/lib/taskImport';

const fixturePath = join(__dirname, '../test/fixtures/tasks-import.json');

describe('parseTasksImportFile', () => {
  it('parses a valid tasks import file', () => {
    const contents = readFileSync(fixturePath, 'utf-8');
    const result = parseTasksImportFile(contents);

    expect(result).toEqual({
      tasks: [
        {
          title: 'Set up analytics',
          description: 'Configure tracking for the marketing site',
          status: 'todo',
          tags: ['analytics', 'setup'],
        },
        {
          title: 'Review homepage copy',
          description: 'Proofread hero and feature sections',
          status: 'in_progress',
          tags: ['copy', 'review'],
        },
        {
          title: 'Ship launch checklist',
          status: 'done',
          tags: ['launch'],
        },
      ],
    });
  });

  it('returns an error for invalid JSON', () => {
    expect(parseTasksImportFile('not json')).toEqual({ error: 'File must be valid JSON.' });
  });

  it('returns an error when a row is missing a title', () => {
    expect(parseTasksImportFile('[{ "description": "No title" }]')).toEqual({
      error: 'Row 1 is missing a valid title.',
    });
  });
});

describe('toCreateTaskInputs', () => {
  it('maps import rows to create task inputs', () => {
    const result = toCreateTaskInputs('project-1', [
      { title: 'Task A', tags: ['design', 'design'] },
    ]);

    expect(result).toEqual([
      {
        projectId: 'project-1',
        title: 'Task A',
        description: undefined,
        status: undefined,
        tags: ['design'],
      },
    ]);
  });
});
