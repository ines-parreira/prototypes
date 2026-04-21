import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './server'

global.ResizeObserver = vi.fn().mockImplementation(function ResizeObserver() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }
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
