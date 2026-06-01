import { describe, expect, it } from 'vitest';
import { normalizeTags } from '@renderer/lib/taskTags';

describe('normalizeTags', () => {
  it('trims whitespace and removes empty values', () => {
    expect(normalizeTags(['  design  ', '', '   '])).toEqual(['design']);
  });

  it('deduplicates tags case-insensitively', () => {
    expect(normalizeTags(['Design', 'design', 'DESIGN'])).toEqual(['Design']);
  });
});
