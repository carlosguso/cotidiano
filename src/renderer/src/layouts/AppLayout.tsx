import { useState } from 'react';
import { useProjects } from '@renderer/context/ProjectsContext';
import { useTodos } from '@renderer/context/TodosContext';
import { Sidebar } from '@renderer/components/sidebar/Sidebar';
import { MainContent } from '@renderer/components/MainContent';
import { ProjectModal } from '@renderer/components/projects/ProjectModal';
import { TodoListModal } from '@renderer/components/todos/TodoListModal';

export function AppLayout() {
  const { selectProject } = useProjects();
  const { selectTodoList } = useTodos();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTodoListOpen, setCreateTodoListOpen] = useState(false);

  const handleSelectProject = (projectId: string) => {
    selectTodoList(null);
    selectProject(projectId);
  };

  const handleSelectTodoList = (todoListId: string) => {
    selectProject(null);
    selectTodoList(todoListId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        onCreateProject={() => setCreateProjectOpen(true)}
        onCreateTodoList={() => setCreateTodoListOpen(true)}
        onSelectProject={handleSelectProject}
        onSelectTodoList={handleSelectTodoList}
      />
      <MainContent />
      <ProjectModal open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
      <TodoListModal open={createTodoListOpen} onClose={() => setCreateTodoListOpen(false)} />
    </div>
  );
}
