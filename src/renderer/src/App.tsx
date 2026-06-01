import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import { TasksProvider } from '@renderer/context/TasksContext';
import { AppLayout } from '@renderer/layouts/AppLayout';

function App() {
  return (
    <ProjectsProvider>
      <TasksProvider>
        <AppLayout />
      </TasksProvider>
    </ProjectsProvider>
  );
}

export default App;
