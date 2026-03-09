import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { mergeRsbuildConfig } from '@rsbuild/core'
import type { StorybookConfig } from 'storybook-react-rsbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const cssDir = join(__dirname, '../src/assets/css')
const launchDarklyMockPath = fileURLToPath(
    new URL('./launchdarkly-js-client-sdk.tsx', import.meta.url),
)

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-docs'],
    framework: 'storybook-react-rsbuild',
    staticDirs: [
        {
            from: '../src/assets',
            to: 'assets',
        },
        {
            from: '../node_modules/@gorgias/axiom/dist/assets',
            to: 'gorgias/axiom',
        },
    ],
    typescript: {
        check: false,
        skipCompiler: true,
        reactDocgen: 'react-docgen',
    },
    async rsbuildFinal(baseConfig) {
        return mergeRsbuildConfig(baseConfig, {
            resolve: {
                alias: {
                    css: cssDir,
                    'launchdarkly-js-client-sdk': launchDarklyMockPath,
                },
            },
        })
    },
}

export default config
