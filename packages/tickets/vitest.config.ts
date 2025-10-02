import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        coverage: {
            exclude: ['src/index.ts'],
        },
    },
})
