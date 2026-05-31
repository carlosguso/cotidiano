import { useState } from 'react';
import { Sidebar } from '@renderer/components/sidebar/Sidebar';
import { CreateProjectModal } from '@renderer/components/projects/CreateProjectModal';
import { ProjectDetail } from '@renderer/components/projects/ProjectDetail';

export function AppLayout() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar onCreateProject={() => setCreateModalOpen(true)} />
      <ProjectDetail />
      <CreateProjectModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
}
