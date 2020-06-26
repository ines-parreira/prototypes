module.exports = {
    rules: {
        'consistent-return': [
            'off',
        ],
        'flowtype/no-types-missing-file-annotation': [
            'off',
        ],
        'jsx-a11y/no-autofocus': [
            'off',
        ],
        'jsx-a11y/tabindex-no-positive': [
            'off',
        ],
        'jsx-a11y/click-events-have-key-events': [
            'off',
        ],
        'jsx-a11y/onclick-has-role': [
            'off',
        ],
        'jsx-a11y/label-has-for': [
            'off',
        ],
        'jsx-a11y/no-onchange': [
            'off',
        ],
        'jsx-a11y/anchor-is-valid': [
            'off',
        ],
        'jsx-a11y/no-static-element-interactions': [
            'off',
        ],
        'jsx-a11y/no-noninteractive-tabindex': [
            'off',
        ],
        'jsx-a11y/no-noninteractive-element-interactions': [
            'off',
        ],
        'react/display-name': [
            'off'
        ],
        'react/no-find-dom-node': [
            'off'
        ],
        'react/no-deprecated': [
            'off'
        ],
    },
    extends: [
        require.resolve('@gorgias/javascript-shared-config/eslint-base'),
        require.resolve('@gorgias/javascript-shared-config/eslint-react'),
        'plugin:flowtype/recommended',
    ],
    globals: {
        '$': false,
        'FB': false,
        'Stripe': false,
        'amplitude': false,
    },
    plugins: [
        'flowtype',
    ],
    settings: {
        flowtype: {
            onlyFilesWithFlowAnnotation: true,
        },
    },
}
