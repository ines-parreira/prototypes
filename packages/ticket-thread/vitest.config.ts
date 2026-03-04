import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        setupFiles: ['@repo/config/vitest/setup.ts', './src/tests/setup.ts'],
        coverage: {
            exclude: ['src/index.ts'],
        },
    },
})
