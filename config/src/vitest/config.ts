import Oxc from 'unplugin-oxc/vite'
import { mergeConfig, ViteUserConfig } from 'vitest/config'

export type Config = ViteUserConfig

export function createConfig(overrides?: Config): Config {
    return mergeConfig(
        {
            plugins: [Oxc()],
            test: {
                env: { TZ: 'UTC' },
                globals: true,
                setupFiles: ['@repo/config/vitest/setup.ts'],
                environment: 'happy-dom',
                server: {
                    deps: {
                        inline: [/@gorgias\/axiom/],
                    },
                },

                // Required for the Codecov tests results to be uploaded
                // These are needed for the Codecov tests analytics like flakiness reports for example
                reporters: process.env['CI']
                    ? ['default', 'junit']
                    : ['default'],
                outputFile: process.env['CI'] ? './junit.xml' : undefined,
                coverage: {
                    reporter: process.env['CI']
                        ? ['lcov']
                        : ['clover', 'lcov', 'text'],
                    reportOnFailure: true,
                    exclude: ['vitest.config.ts', '**/fixtures/**'],
                },
            },
        },
        overrides ?? {},
    )
}
