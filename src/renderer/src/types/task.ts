export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
};

export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status'>>;
