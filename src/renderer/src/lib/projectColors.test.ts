import { describe, expect, it } from 'vitest';
import { suggestIdentifier } from '@renderer/lib/projectColors';

describe('suggestIdentifier', () => {
  it('returns empty string for blank input', () => {
    expect(suggestIdentifier('')).toBe('');
    expect(suggestIdentifier('   ')).toBe('');
  });

  it('uses up to four characters from a single word', () => {
    expect(suggestIdentifier('Marketing')).toBe('MARK');
    expect(suggestIdentifier('Hi')).toBe('HI');
  });

  it('strips non-alphanumeric characters from a single word', () => {
    expect(suggestIdentifier('Go-Live')).toBe('GOLI');
  });

  it('uses initials from multiple words', () => {
    expect(suggestIdentifier('Marketing Site')).toBe('MS');
    expect(suggestIdentifier('My Cool Project')).toBe('MCP');
  });
});
