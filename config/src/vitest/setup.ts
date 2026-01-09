import '@testing-library/jest-dom'

import * as matchers from 'jest-extended'
import { afterEach, expect, vi } from 'vitest'

expect.extend(matchers)

afterEach(() => {
    vi.clearAllMocks()
})
