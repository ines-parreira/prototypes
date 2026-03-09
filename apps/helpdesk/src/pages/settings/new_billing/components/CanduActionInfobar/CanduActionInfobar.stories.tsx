import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import CanduActionInfobar from 'pages/settings/new_billing/components/CanduActionInfobar/CanduActionInfobar'

const storyConfig: Meta<typeof CanduActionInfobar> = {
    title: 'General/Bars/CanduActionInfobar',
    component: CanduActionInfobar,
    argTypes: {
        text: {
            control: {
                type: 'text',
            },
        },
        btnLabel: {
            control: {
                type: 'text',
            },
        },
        canduId: {
            control: {
                type: 'text',
            },
        },
        onClick: {
            action: 'clicked!',
        },
    },
}

type Story = StoryObj<typeof CanduActionInfobar>

const templateParameters = {
    controls: {
        include: ['text', 'btnLabel', 'canduId', 'onClick'],
    },
}

const defaultProps: ComponentProps<typeof CanduActionInfobar> = {
    text: 'Book a demo to learn about our new features',
    btnLabel: 'Book a demo',
    canduId: 'book-demo-candu-id',
    onClick: () => null,
}

export const Default: Story = {
    args: { ...defaultProps },
    parameters: { ...templateParameters },
}

export default storyConfig
