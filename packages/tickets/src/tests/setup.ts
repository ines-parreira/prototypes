import { afterEach } from 'vitest'

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

afterEach(async () => {
    await testAppQueryClient.cancelQueries()
    testAppQueryClient.clear()
})
