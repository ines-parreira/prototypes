import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { AIButton } from './AIButton'

const meta: Meta<typeof AIButton> = {
    title: 'Components/AIButton',
    component: AIButton,
    args: {
        children: 'Click me!',
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta
type Story = StoryObj<typeof AIButton>

export const Default: Story = {}

export const Disabled: Story = {
    args: {
        isDisabled: true,
    },
}

export const Loading: Story = {
    args: {
        isLoading: true,
    },
}
