import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { fn } from 'storybook/test'

import { PlaygroundInitialContent } from './PlaygroundInitialContent'

const meta = {
    title: 'AI Agent/PlaygroundV2/PlaygroundInitialContent',
    component: PlaygroundInitialContent,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PlaygroundInitialContent>

export default meta
type Story = StoryObj<typeof meta>

// With actions
export const WithActions: Story = {
    args: {
        onStartClick: fn(),
        isLoading: false,
    },
}

export const WithActionsLoading: Story = {
    args: {
        onStartClick: fn(),
        isLoading: true,
    },
}

// Without actions
export const WithoutActions: Story = {
    args: {
        onStartClick: undefined,
        isLoading: false,
    },
}

export const WithoutActionsLoading: Story = {
    args: {
        onStartClick: undefined,
        isLoading: true,
    },
}
