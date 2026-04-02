import { defaultConfig } from '@repo/config/jest'

export default {
    ...defaultConfig,
    collectCoverageFrom: [
        ...(defaultConfig.collectCoverageFrom ?? []),
        '!<rootDir>/vitest/**',
    ],
}
