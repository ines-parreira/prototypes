import { Meta, StoryObj } from '@storybook/react'

import { PlaygroundSegmentControl } from './PlaygroundSegmentControl'

const meta: Meta<typeof PlaygroundSegmentControl> = {
    title: 'AI Agent/Playground/SegmentControl',
    component: PlaygroundSegmentControl,
    argTypes: {
        selectedValue: {
            control: {
                type: 'select',
                options: ['email', 'chat'],
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof PlaygroundSegmentControl>

export const Default: Story = {
    render: (args) => <PlaygroundSegmentControl {...args} />,
    args: {
        selectedValue: 'email',
    },
}
