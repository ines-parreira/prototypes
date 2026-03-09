import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LoadingDraftKnowledge } from './LoadingDraftKnowledge'

const meta = {
    title: 'AI Agent/PlaygroundV2/LoadingDraftKnowledge',
    component: LoadingDraftKnowledge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof LoadingDraftKnowledge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}

export const CustomTitle: Story = {
    args: {
        title: 'Preparing your AI assistant...',
    },
}

export const CustomSubtitle: Story = {
    args: {
        subtitle:
            'Loading draft knowledge and preparing the AI assistant for your conversation...',
    },
}

export const CustomTitleAndSubtitle: Story = {
    args: {
        title: 'Setting up your preview',
        subtitle: 'This will only take a moment while we prepare everything.',
    },
}
