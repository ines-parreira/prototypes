import { afterAll, afterEach, beforeAll } from 'vitest'

import { testAppQueryClient } from './render.utils'
import { server } from './server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})
