require('@storybook/addon-console')

require('../g/static/private/css/main.less')

export const parameters = {
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
}
