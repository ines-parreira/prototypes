import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { AlertBanner } from './AlertBanner'

type Story = StoryObj<typeof AlertBanner>

const storyConfig: Meta = {
    title: 'Feedback/AlertBanner',
    component: AlertBanner,
    parameters: {
        docs: {
            description: {
                component: 'Banner component',
            },
        },
    },
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
            options: ['critical', 'warning', 'info'],
        },
        message: {
            control: {
                type: 'text',
            },
        },
        borderless: {
            control: {
                type: 'boolean',
            },
        },
    },
}

export default storyConfig

const defaultProps = {
    message: 'This is a banner message',
}

export const Default: Story = {
    args: defaultProps,
}

export const Closable: Story = {
    args: {
        ...defaultProps,
        onClose: () => undefined,
    },
}

export const WithCTA: Story = {
    args: {
        ...defaultProps,
        CTA: {
            type: 'action',
            text: 'Click me',
            onClick: () => undefined,
        },
    },
}
