import { Meta, StoryObj } from '@storybook/react'

import { ActivationManageButton } from './ActivationManageButton'

const meta: Meta<typeof ActivationManageButton> = {
    title: 'AI Agent/Activation/ManageButton',
    component: ActivationManageButton,
    args: {},
}

export default meta

type Story = StoryObj<typeof ActivationManageButton>

export const ActivationManageButtonDefault: Story = {
    render: (args) => <ActivationManageButton {...args} />,
    args: {
        progress: 0.4,
    },
}
