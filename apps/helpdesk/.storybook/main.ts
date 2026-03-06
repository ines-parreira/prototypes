import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from 'storybook-react-rsbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

const srcDir = join(__dirname, '../src')

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.(js|jsx|ts|tsx)'],
    staticDirs: [
        srcDir,
        {
            from: '../node_modules/@gorgias/axiom/dist/assets',
            to: 'gorgias/axiom',
        },
    ],

    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-docs'),
    ],
    framework: {
        name: getAbsolutePath('storybook-react-rsbuild'),
        options: {},
    },
    typescript: {
        check: false,
        skipCompiler: true,
        reactDocgen: 'react-docgen',
    },
}

export default config
