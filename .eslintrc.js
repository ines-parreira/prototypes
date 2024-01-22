module.exports = {
    rules: {
        // Common rules
        'consistent-return': ['off'],
        'jsx-a11y/no-autofocus': ['off'],
        'jsx-a11y/tabindex-no-positive': ['off'],
        'jsx-a11y/click-events-have-key-events': ['off'],
        'jsx-a11y/onclick-has-role': ['off'],
        'jsx-a11y/label-has-for': ['off'],
        'jsx-a11y/no-onchange': ['off'],
        'jsx-a11y/anchor-is-valid': ['off'],
        'jsx-a11y/no-static-element-interactions': ['off'],
        'jsx-a11y/no-noninteractive-tabindex': ['off'],
        'jsx-a11y/no-noninteractive-element-interactions': ['off'],
        'react-hooks/exhaustive-deps': ['error'],
        'react/display-name': ['off'],
        'react/no-find-dom-node': ['off'],
        'react/no-deprecated': ['off'],
        'react/jsx-key': [
            'error',
            {
                checkFragmentShorthand: true,
            },
        ],
        'no-prototype-builtins': ['off'],
        'no-async-promise-executor': ['off'],
        'no-unused-vars': 'off',
        'import/no-named-as-default': ['warn'],
        'import/export': ['warn'],
        'import/default': ['off'],
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
            },
        ],
        'import/namespace': ['off'],
        'import/no-named-as-default-member': ['off'],
        'react/prop-types': 'off',
        'import/no-unresolved': [2, {ignore: ['estree']}],
        'import/newline-after-import': ['error'],
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'react-redux',
                        importNames: ['useDispatch'],
                        message:
                            'Please use useAppDispatch from /hooks/useAppDispatch instead.',
                    },
                    {
                        name: 'react-redux',
                        importNames: ['useSelector'],
                        message:
                            'Please use useAppSelector from /hooks/useAppSelector instead.',
                    },
                ],
            },
        ],
        'no-restricted-properties': [
            'error',
            {
                object: 'axios',
                property: 'get',
                message: 'Please use client from models/api/resources instead',
            },
            {
                object: 'axios',
                property: 'post',
                message: 'Please use client from models/api/resources instead',
            },
            {
                object: 'axios',
                property: 'put',
                message: 'Please use client from models/api/resources instead',
            },
            {
                object: 'axios',
                property: 'delete',
                message: 'Please use client from models/api/resources instead',
            },
            {
                object: 'axios',
                property: 'create',
                message: 'Please use client from models/api/resources instead',
            },
            {
                object: 'jest',
                property: 'clearAllMocks',
                message: 'Mocks are cleared by default before every test',
            },
        ],
        // TSLint rules
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-argument': ['off'],
        '@typescript-eslint/no-floating-promises': [2, {ignoreVoid: true}],
        '@typescript-eslint/ban-ts-comment': ['off'],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^__',
                varsIgnorePattern: '^__',
            },
        ],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-non-null-assertion': ['off'],
    },
    extends: [
        require.resolve('@gorgias/javascript-shared-config/eslint-base'),
        require.resolve('@gorgias/javascript-shared-config/eslint-react'),
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/typescript',
        'prettier',
    ],
    globals: {
        $: false,
        FB: false,
        Stripe: false,
        amplitude: false,
    },
    plugins: ['prettier', '@typescript-eslint'],
    ignorePatterns: [
        'src/types/**',
        'src/rest_api/help_center_api/**',
        'src/rest_api/ssp_api/client.generated.d.ts',
        'src/coverage/**',
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            },
            node: {
                extensions: ['.ts', '.tsx', '.d.ts'],
                paths: ['src'],
            },
        },
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            experimentalObjectRestSpread: true,
            legacyDecorators: true,
        },
        project: './tsconfig.json',
    },
    overrides: [
        {
            files: ['**/*.spec.ts', '**/*.spec.tsx'],
            rules: {
                '@typescript-eslint/unbound-method': ['off'],
            },
        },
    ],
}
