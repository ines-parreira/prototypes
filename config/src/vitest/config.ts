import { mergeConfig, ViteUserConfig } from 'vitest/config'

export type Config = ViteUserConfig

export function createConfig(overrides?: Config): Config {
    return mergeConfig(
        {
            test: {
                globals: true,
                setupFiles: ['@repo/config/vitest/setup.ts'],
                environment: 'jsdom',

                // Required for the Codecov tests results to be uploaded
                // These are needed for the Codecov tests analytics like flakiness reports for example
                reporters: process.env['CI']
                    ? ['default', 'junit']
                    : ['default'],
                outputFile: process.env['CI'] ? './junit.xml' : undefined,
                coverage: {
                    exclude: ['vitest.config.ts'],
                },
            },
        },
        overrides ?? {},
    )
}
