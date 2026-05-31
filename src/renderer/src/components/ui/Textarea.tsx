import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function Textarea({ label, hint, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block space-y-1.5" htmlFor={textareaId}>
      {label ? <span className="text-sm font-medium text-zinc-300">{label}</span> : null}
      <textarea
        id={textareaId}
        className={`min-h-24 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 ${className}`}
        {...props}
      />
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
