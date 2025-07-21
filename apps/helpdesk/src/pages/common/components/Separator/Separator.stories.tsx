import { Meta, StoryObj } from '@storybook/react'

import { Separator } from './Separator'

const storyConfig: Meta<typeof Separator> = {
    title: 'General/Separator/Separator',
    component: Separator,
}

type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
    args: {},
}
export const Vertical: Story = {
    args: {
        direction: 'vertical',
    },
}
export const HorizontalDashed: Story = {
    args: {
        variant: 'dashed',
    },
}
export const VerticalDashed: Story = {
    args: {
        direction: 'vertical',
        variant: 'dashed',
    },
}

export default storyConfig
