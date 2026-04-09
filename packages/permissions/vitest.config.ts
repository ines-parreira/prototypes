import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        setupFiles: ['./src/tests/setup.ts'],
        coverage: {
            exclude: ['src/index.ts', 'vitest.config.ts'],
        },
    },
})
