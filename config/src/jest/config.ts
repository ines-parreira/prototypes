import type { Config } from 'jest'

/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export type { Config }

export const defaultConfig: Config = {
    // The directory where Jest should store its cached dependency information
    cacheDirectory: '.cache/jest/',
    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        '<rootDir>/**/*.{js,ts,jsx,tsx}',
        '!**/node_modules/**',
        '!**/vendor/**',
        '!**/bower_components/**',
        '!**/_build/**',
        '!**/*.stories.*',
        '!**/fixtures/**',
        '!**/fixtures.ts',
    ],
    // The directory where Jest should output its coverage files
    coverageDirectory:
        (process.env.COVERAGE_DIR || '<rootDir>/../coverage/') + 'jest/',
    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: ['lcov'],
    // A set of global variables that need to be available in all test environments
    globals: { IMAGE_PROXY_URL: 'http://image-proxy/' },
    // An array of file extensions your modules use
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    // Use this configuration option to add custom reporters to Jest
    reporters: [
        'default',
        !!process.env['CI'] && [
            'jest-junit',
            {
                suiteName: 'jest tests',
                classNameTemplate: '{classname}',
                titleTemplate: '{title}',
                addFileAttribute: 'true',
                ancestorSeparator: ' › ',
            },
        ],
    ].filter(Boolean) as Config['reporters'],
    // The root directory that Jest should scan for tests and modules within
    rootDir: 'src/',
    // A list of paths to directories that Jest should use to search for files in
    roots: ['<rootDir>'],
    modulePaths: ['<rootDir>'],
    moduleDirectories: ['node_modules'],
    // The test environment that will be used for testing
    testEnvironment: 'jest-fixed-jsdom',
    // The regexp pattern or array of patterns that Jest uses to detect test files
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|tsx?)$',
    // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.(t|j)sx?$': [
            '@swc/jest',
            {
                jsc: {
                    transform: {
                        react: {
                            runtime: 'automatic',
                        },
                    },
                    experimental: {
                        plugins: [['swc_mut_cjs_exports', {}]],
                    },
                },
            },
        ],
    },
}
