import { createConfig } from '@repo/config/vitest'

export default createConfig({
    test: {
        coverage: {
            exclude: [
                // Exclude feature flag keys enum from coverage as it's just constant definitions
                '**/featureFlagKey.ts',
                'vitest.config.ts',
                'src/index.ts',
            ],
        },
    },
})
