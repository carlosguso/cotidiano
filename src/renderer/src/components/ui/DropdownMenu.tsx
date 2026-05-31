import { useEffect, useRef, useState, type ReactNode } from 'react';

export type DropdownMenuItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'end';
  ariaLabel: string;
};

export function DropdownMenu({ trigger, items, align = 'end', ariaLabel }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      >
        {trigger}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-20 mt-1 min-w-40 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => handleItemClick(item)}
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                item.destructive
                  ? 'text-red-400 hover:bg-red-950/50 hover:text-red-300'
                  : 'text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MoreVerticalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-4"
    >
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
