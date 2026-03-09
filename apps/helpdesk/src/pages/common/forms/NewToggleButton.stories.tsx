import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { NewToggleButton } from './NewToggleButton'

const meta: Meta<typeof NewToggleButton> = {
    title: 'AI Agent/Activation/NewToggleButton',
    component: NewToggleButton,
    args: {},
}

export default meta

type Story = StoryObj<typeof NewToggleButton>

export const NewToggleButtonDefault: Story = {
    render: (args) => <NewToggleButton {...args} />,
    args: {},
}

export const NewToggleButtonSmall: Story = {
    render: (args) => <NewToggleButton {...args} size="small" />,
    args: {},
}
