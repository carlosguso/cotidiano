import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('ConfirmModal', () => {
  it('renders title and description when open', () => {
    renderWithProviders(
      <ConfirmModal
        open
        title="Delete project?"
        description="This action cannot be undone."
        confirmLabel="Delete project"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        destructive
      />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete project?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmModal
        open
        title="Archive project?"
        description="It will be hidden from the sidebar."
        confirmLabel="Archive project"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Archive project' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onClose when cancelled', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <ConfirmModal
        open
        title="Archive project?"
        description="It will be hidden from the sidebar."
        confirmLabel="Archive project"
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
