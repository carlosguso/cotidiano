import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { clearElectronAPI } from '@renderer/test/in-memory-electron-api';

afterEach(() => {
  cleanup();
  clearElectronAPI();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

let uuidCounter = 0;

vi.stubGlobal('crypto', {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
});
