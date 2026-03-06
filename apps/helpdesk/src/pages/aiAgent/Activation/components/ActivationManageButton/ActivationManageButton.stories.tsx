import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import { ActivationManageButton } from './ActivationManageButton'

const meta: Meta<typeof ActivationManageButton> = {
    title: 'AI Agent/Activation/ManageButton',
    component: ActivationManageButton,
    args: {
        onClick: action('onClick'),
    },
}

export default meta

type Story = StoryObj<typeof ActivationManageButton>

export const LegacyBordered: Story = {
    render: (args) => (
        <ActivationManageButton
            {...args}
            progress={0.4}
            hasAiAgentNewActivationXp={false}
        />
    ),
}

export const LegacyFlat: Story = {
    render: (args) => (
        <ActivationManageButton
            {...args}
            progress={0.4}
            variant={'flat'}
            hasAiAgentNewActivationXp={false}
        />
    ),
}

export const Bordered: Story = {
    render: (args) => (
        <ActivationManageButton
            {...args}
            variant={'bordered'}
            hasAiAgentNewActivationXp
        />
    ),
}

export const FlatOff: Story = {
    render: (args) => (
        <ActivationManageButton
            {...args}
            variant={'flat'}
            status={'off'}
            hasAiAgentNewActivationXp
        />
    ),
}

export const FlatLive: Story = {
    render: (args) => (
        <ActivationManageButton
            {...args}
            variant={'flat'}
            status={'live'}
            hasAiAgentNewActivationXp
        />
    ),
}
