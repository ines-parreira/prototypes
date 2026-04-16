import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        coverage: {
            exclude: ['vitest.config.ts', 'src/index.ts'],
        },
    },
})
