import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-100 text-zinc-950 hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-400',
  secondary:
    'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800 disabled:text-zinc-500',
  ghost: 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 disabled:text-zinc-600',
  danger:
    'border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-800 hover:bg-red-950/70 disabled:text-red-900',
};

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
