import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import { testAppQueryClient } from './render.utils'

global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return []
    }
    unobserve() {}
} as any

global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
} as any

if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = () => document.body ?? document.documentElement
}

if (typeof document.elementsFromPoint !== 'function') {
    document.elementsFromPoint = () => [
        document.body ?? document.documentElement,
    ]
}

afterEach(async () => {
    cleanup()
    await testAppQueryClient.cancelQueries()
    testAppQueryClient.clear()
    vi.restoreAllMocks()
    vi.useRealTimers()
})
