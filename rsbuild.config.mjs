import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from '@rsbuild/core'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { pluginReact } from '@rsbuild/plugin-react'

import rspackConfig from './rspack.app.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * I couldn't get this to work with the pluginLess, so I'm following this example:
 * Following this example: https://github.com/rspack-contrib/storybook-rsbuild/blob/main/sandboxes/rspack-react-18/rsbuild.config.ts
 */
const srcDir = path.join(__dirname, 'src')

/** @type {import('@rsbuild/core').RsbuildConfig} */
const config = defineConfig({
    plugins: [pluginNodePolyfill(), pluginReact()],
    resolve: {
        alias: {
            css: `${srcDir}/assets/css/`,
            'react/jsx-runtime': 'react/jsx-runtime.js',
            'launchdarkly-react-client-sdk': require.resolve(
                './.storybook/launchdarkly-js-client-sdk.tsx',
            ),
            'launchdarkly-js-client-sdk': require.resolve(
                './.storybook/launchdarkly-js-client-sdk.tsx',
            ),
        },
        extensions: ['.ts', '.tsx', '.js'],
    },
    tools: {
        rspack: (config) => {
            // Apply less loader from the Rspack config.
            const lessLoader = rspackConfig.module.rules[2]
            config.module.rules.push(lessLoader)
            return config
        },
    },
})

export default config
