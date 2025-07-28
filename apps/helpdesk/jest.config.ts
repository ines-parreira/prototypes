import defaultConfig from '@repo/jest-config'
import type { Config } from 'jest'

const config: Config = {
    ...defaultConfig,
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/__mocks__/fileMock.ts',
        '\\.(css|less)$': 'identity-obj-proxy',
        uuid: 'uuid',
        'react-markdown': '<rootDir>/tests/__mocks__/react-markdown.ts',
        'rehype-raw': '<rootDir>/tests/__mocks__/rehype-raw.ts',
    },
    setupFiles: ['jest-launchdarkly-mock', 'construct-style-sheets-polyfill'],
    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['./tests/setup.tsx'],
    testEnvironmentOptions: {
        customExportConditions: ['msw'],
    },
    transformIgnorePatterns: [
        '/node_modules/(?!.pnpm|jsonpath-plus|@gorgias|lodash-es|react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd|react-markdown|rehype-raw)',
    ],
}

export default config
