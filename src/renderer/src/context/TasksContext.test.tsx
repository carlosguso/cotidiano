import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TasksProvider, useTasks } from '@renderer/context/TasksContext';
import { createMockTask } from '@renderer/test/fixtures/tasks';

describe('TasksContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useTasks())).toThrow(
      'useTasks must be used within a TasksProvider',
    );
  });

  it('creates a task for a project', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TasksProvider,
    });

    act(() => {
      result.current.createTask({
        projectId: 'project-1',
        title: 'Design homepage',
        description: 'Wireframe the hero section',
        status: 'in_progress',
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      id: 'test-uuid-1',
      projectId: 'project-1',
      title: 'Design homepage',
      description: 'Wireframe the hero section',
      status: 'in_progress',
    });
  });

  it('returns tasks scoped to a project', () => {
    const taskA = createMockTask({ id: 'task-a', projectId: 'project-1', title: 'Alpha' });
    const taskB = createMockTask({ id: 'task-b', projectId: 'project-2', title: 'Beta' });
    const taskC = createMockTask({
      id: 'task-c',
      projectId: 'project-1',
      title: 'Charlie',
      createdAt: '2024-06-02T12:00:00.000Z',
    });

    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => (
        <TasksProvider initialTasks={[taskA, taskB, taskC]}>{children}</TasksProvider>
      ),
    });

    expect(result.current.tasksForProject('project-1').map((task) => task.title)).toEqual([
      'Alpha',
      'Charlie',
    ]);
    expect(result.current.tasksForProject('project-2')).toHaveLength(1);
    expect(result.current.tasksForProject('missing')).toHaveLength(0);
  });

  it('updates a task', () => {
    const task = createMockTask();
    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => (
        <TasksProvider initialTasks={[task]}>{children}</TasksProvider>
      ),
    });

    act(() => {
      result.current.updateTask(task.id, {
        title: 'Updated task',
        description: 'Updated description',
        status: 'done',
      });
    });

    expect(result.current.tasks[0]).toMatchObject({
      title: 'Updated task',
      description: 'Updated description',
      status: 'done',
    });
    expect(result.current.tasks[0].updatedAt).not.toBe(task.updatedAt);
  });

  it('deletes a task', () => {
    const task = createMockTask();
    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => (
        <TasksProvider initialTasks={[task]}>{children}</TasksProvider>
      ),
    });

    act(() => {
      result.current.deleteTask(task.id);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('deletes all tasks for a project', () => {
    const taskA = createMockTask({ id: 'task-a', projectId: 'project-1' });
    const taskB = createMockTask({ id: 'task-b', projectId: 'project-1' });
    const taskC = createMockTask({ id: 'task-c', projectId: 'project-2' });

    const { result } = renderHook(() => useTasks(), {
      wrapper: ({ children }) => (
        <TasksProvider initialTasks={[taskA, taskB, taskC]}>{children}</TasksProvider>
      ),
    });

    act(() => {
      result.current.deleteTasksForProject('project-1');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('task-c');
  });
});
