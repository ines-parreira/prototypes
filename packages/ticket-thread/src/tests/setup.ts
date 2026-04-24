import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './server'

global.ResizeObserver = vi.fn().mockImplementation(function ResizeObserver() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }
})

Object.defineProperty(document, 'execCommand', {
    configurable: true,
    writable: true,
    value: vi.fn(() => true),
})

Object.defineProperty(window, 'prompt', {
    configurable: true,
    writable: true,
    value: vi.fn(() => null),
})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(async () => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
