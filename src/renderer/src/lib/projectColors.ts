import type { ProjectColor } from '@renderer/types/project';

export const PROJECT_COLORS: ProjectColor[] = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
];

export const PROJECT_COLOR_CLASSES: Record<
  ProjectColor,
  { bg: string; text: string; ring: string }
> = {
  gray: { bg: 'bg-zinc-500', text: 'text-zinc-100', ring: 'ring-zinc-500/40' },
  red: { bg: 'bg-red-500', text: 'text-red-100', ring: 'ring-red-500/40' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-100', ring: 'ring-orange-500/40' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-950', ring: 'ring-yellow-500/40' },
  green: { bg: 'bg-emerald-500', text: 'text-emerald-950', ring: 'ring-emerald-500/40' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-100', ring: 'ring-blue-500/40' },
  purple: { bg: 'bg-violet-500', text: 'text-violet-100', ring: 'ring-violet-500/40' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-100', ring: 'ring-pink-500/40' },
};

export function suggestIdentifier(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  if (words.length === 1) {
    return words[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  }

  return words
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, '').charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase();
}
