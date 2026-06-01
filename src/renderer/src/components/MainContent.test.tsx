import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MainContent } from '@renderer/components/MainContent';
import { renderWithProviders } from '@renderer/test/test-utils';

describe('MainContent', () => {
  it('shows the empty state when nothing is selected', () => {
    renderWithProviders(<MainContent />);

    expect(screen.getByText('Get started')).toBeInTheDocument();
    expect(screen.getByText(/Select a project to manage tasks/)).toBeInTheDocument();
  });
});
