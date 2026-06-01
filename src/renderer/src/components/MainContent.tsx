import { useProjects } from '@renderer/context/ProjectsContext';
import { useTodos } from '@renderer/context/TodosContext';
import { ProjectDetail } from '@renderer/components/projects/ProjectDetail';
import { TodoListDetail } from '@renderer/components/todos/TodoListDetail';

export function MainContent() {
  const { selectedProject } = useProjects();
  const { selectedTodoList } = useTodos();

  if (selectedTodoList) {
    return <TodoListDetail />;
  }

  if (selectedProject) {
    return <ProjectDetail />;
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium text-foreground">Get started</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a project to manage tasks and documents, or open a todo list for a mixed work
          session across projects.
        </p>
      </div>
    </div>
  );
}
