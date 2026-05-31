import { ProjectsProvider } from '@renderer/context/ProjectsContext';
import { AppLayout } from '@renderer/layouts/AppLayout';

function App() {
  return (
    <ProjectsProvider>
      <AppLayout />
    </ProjectsProvider>
  );
}

export default App;
