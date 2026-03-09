import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import MainTitle from './MainTitle'

const meta = {
    title: 'AI Agent/Onboarding/MainTitle',
    component: MainTitle,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof MainTitle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        titleBlack: 'Welcome to ',
        titleMagenta: 'AI Agent',
    },
}

export const LongTitle: Story = {
    args: {
        titleBlack: 'This is a very long title to demonstrate ',
        titleMagenta: 'how the component handles longer text content',
    },
}

export const WithSecondaryTitle: Story = {
    args: {
        titleBlack: 'Welcome to ',
        titleMagenta: 'AI Agent!',
        secondaryTitle: 'Select your agents below to get started.',
    },
}
