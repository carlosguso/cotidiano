import { useState } from 'react';
import { Sidebar } from '@renderer/components/sidebar/Sidebar';
import { ProjectModal } from '@renderer/components/projects/ProjectModal';
import { ProjectDetail } from '@renderer/components/projects/ProjectDetail';

export function AppLayout() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar onCreateProject={() => setCreateModalOpen(true)} />
      <ProjectDetail />
      <ProjectModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
}
