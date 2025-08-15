import { mergeConfig, ViteUserConfig } from 'vitest/config'

export type Config = ViteUserConfig

export function createConfig(overrides?: Config): Config {
    return mergeConfig(
        {
            test: {
                globals: true,
                setupFiles: ['@repo/config/vitest/setup.ts'],
                environment: 'jsdom',
            },
        },
        overrides ?? {},
    )
}
