import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SearchableSelectOption = {
  value: string;
  label: string;
  searchText?: string;
};

type SearchableSelectProps = {
  id?: string;
  label: string;
  placeholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  renderOption?: (option: SearchableSelectOption) => ReactNode;
};

function matchesQuery(option: SearchableSelectOption, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = `${option.label} ${option.searchText ?? ''}`.toLowerCase();
  return haystack.includes(normalized);
}

export function SearchableSelect({
  id,
  label,
  placeholder = 'Search…',
  emptyMessage = 'No options available.',
  noResultsMessage = 'No matches found.',
  options,
  value,
  onValueChange,
  disabled = false,
  renderOption,
}: SearchableSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(
    () => options.filter((option) => matchesQuery(option, query)),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setQuery('');
    setOpen(false);
  };

  const showList = open && !disabled;
  const inputValue = open ? query : (selected?.label ?? '');
  const showSelectedPreview = !open && selected && renderOption;

  const renderOptionContent = (option: SearchableSelectOption) =>
    renderOption ? renderOption(option) : option.label;

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        {showSelectedPreview ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 right-9 flex items-center overflow-hidden">
            {renderOptionContent(selected)}
          </div>
        ) : null}
        <Input
          id={inputId}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={label}
          disabled={disabled}
          placeholder={selected ? undefined : placeholder}
          value={inputValue}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery('');
          }}
          className={cn('pr-9', showSelectedPreview && 'text-transparent caret-transparent')}
        />
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        {showList ? (
          <ul
            id={listboxId}
            role="listbox"
            className={cn(
              'absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md',
            )}
          >
            {options.length === 0 ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyMessage}</li>
            ) : filteredOptions.length === 0 ? (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">{noResultsMessage}</li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      'flex w-full rounded-sm px-2 py-1.5 text-left text-sm text-popover-foreground',
                      'hover:bg-accent hover:text-accent-foreground',
                      option.value === value && 'bg-accent text-accent-foreground',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option.value)}
                  >
                    {renderOptionContent(option)}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
