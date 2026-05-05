import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        coverage: {
            exclude: ['src/vitest/**', 'vitest.config.ts'],
        },
    },
})
