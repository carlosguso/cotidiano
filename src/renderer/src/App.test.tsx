import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@renderer/App';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('App integration', () => {
  it('creates a project through the full UI flow (in-memory state)', async () => {
    const { user } = renderWithProviders(<App />);

    expect(screen.getByText('Get started')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(await screen.findByRole('heading', { name: 'Create project' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Website Refresh');
    await user.clear(screen.getByLabelText('Identifier'));
    await user.type(screen.getByLabelText('Identifier'), 'WEB');
    await user.type(screen.getByLabelText('Description'), 'Main company website');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Website Refresh' })).toBeInTheDocument();
    });

    expect(screen.getByText('Main company website')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Website Refresh/ })).toBeInTheDocument();
  });

  it('creates a project through the IPC-backed in-memory database', async () => {
    const { user } = renderWithProviders(<App />, { useInMemoryElectronAPI: true });

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await user.type(await screen.findByLabelText('Name'), 'Persisted Project');
    await user.clear(screen.getByLabelText('Identifier'));
    await user.type(screen.getByLabelText('Identifier'), 'PST');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Persisted Project' })).toBeInTheDocument();
    });

    const projects = await window.electronAPI.projects.list();
    expect(projects).toHaveLength(1);
    expect(projects[0].identifier).toBe('PST');
  });

  it('selects an existing project from the sidebar', async () => {
    const { user } = renderWithProviders(<App />);

    await user.click(screen.getByRole('button', { name: 'Create project' }));
    await user.type(await screen.findByLabelText('Name'), 'Alpha');
    await user.clear(screen.getByLabelText('Identifier'));
    await user.type(screen.getByLabelText('Identifier'), 'ALP');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Project actions' }));
    await user.click(screen.getByRole('menuitem', { name: /Archive/ }));
    await user.click(await screen.findByRole('button', { name: 'Archive project' }));

    await waitFor(() => {
      expect(screen.getByText('Get started')).toBeInTheDocument();
    });
  });
});
