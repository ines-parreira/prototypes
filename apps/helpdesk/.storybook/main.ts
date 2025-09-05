import { dirname, join } from 'node:path'

import type { StorybookConfig } from 'storybook-react-rsbuild'

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
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: {
        name: getAbsolutePath('storybook-react-rsbuild'),
        options: {},
    },
    docs: {
        autodocs: true,
    },
    typescript: {
        check: false,
        skipCompiler: true,
        reactDocgen: 'react-docgen',
    },
}

export default config
