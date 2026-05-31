import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-zinc-300">{label}</span> : null}
      <input
        id={inputId}
        className={`h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 ${error ? 'border-red-800 focus:border-red-700 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
