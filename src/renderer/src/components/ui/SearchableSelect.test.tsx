import { useState } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { renderWithProviders } from '@renderer/test/test-utils';

const options = [
  { value: 'project-1', label: 'Website', searchText: 'WEB' },
  { value: 'project-2', label: 'Marketing', searchText: 'MKT' },
];

describe('SearchableSelect', () => {
  it('filters options while typing', async () => {
    function Harness() {
      const [value, setValue] = useState('');
      return (
        <SearchableSelect
          label="Project"
          options={options}
          value={value}
          onValueChange={setValue}
        />
      );
    }

    const { user } = renderWithProviders(<Harness />);

    const input = screen.getByRole('combobox', { name: 'Project' });
    await user.click(input);
    await user.type(input, 'mkt');

    expect(screen.getByRole('option', { name: 'Marketing' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Website' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Marketing' }));

    expect(input).toHaveValue('Marketing');
  });

  it('shows a no matches message', async () => {
    const { user } = renderWithProviders(
      <SearchableSelect label="Project" options={options} value="" onValueChange={vi.fn()} />,
    );

    const input = screen.getByRole('combobox', { name: 'Project' });
    await user.click(input);
    await user.type(input, 'zzz');

    expect(screen.getByText('No matches found.')).toBeInTheDocument();
  });
});
