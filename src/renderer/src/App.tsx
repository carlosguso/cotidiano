import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import { TasksProvider } from '@renderer/context/TasksContext';
import { TodosProvider } from '@renderer/context/TodosContext';
import { AppLayout } from '@renderer/layouts/AppLayout';

function App() {
  return (
    <ProjectsProvider>
      <TasksProvider>
        <TodosProvider>
          <AppLayout />
        </TodosProvider>
      </TasksProvider>
    </ProjectsProvider>
  );
}

export default App;
