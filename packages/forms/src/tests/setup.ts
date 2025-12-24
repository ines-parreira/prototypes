import { vi } from 'vitest'

// Mock HTMLCanvasElement for useTextWidth hook
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    measureText: vi.fn(() => ({ width: 0 })),
})) as any
