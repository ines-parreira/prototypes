require('@storybook/addon-console')

require('assets/css/main.less')

export const parameters = {
    chromatic: {disableSnapshot: true},
    options: {
        storySort: {
            order: [
                'Docs Overview',
                'Design System',
                'General',
                'Navigation',
                'Data Entry',
                'Data Display',
                'Feedback',
                'Layout',
            ],
        },
    },
    backgrounds: {
        default: 'light',
        values: [
            {
                name: 'light',
                value: '#fff',
            },
            {
                name: 'grey',
                value: '#eee',
            },
            {
                name: 'dark',
                value: '#333',
            },
        ],
    },
}
