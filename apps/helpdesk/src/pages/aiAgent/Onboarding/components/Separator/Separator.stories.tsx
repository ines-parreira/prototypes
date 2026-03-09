import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Separator } from './Separator'

import './Separator.less'

const meta = {
    title: 'AI Agent/Onboarding/Separator',
    component: Separator,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}

export const ExtraExtraSmall: Story = {
    args: { size: 'xxs' },
}

export const ExtraSmall: Story = {
    args: { size: 'xs' },
}

export const Small: Story = {
    args: { size: 's' },
}

export const Medium: Story = {
    args: { size: 'm' },
}

export const Large: Story = {
    args: { size: 'l' },
}

export const ExtraLarge: Story = {
    args: { size: 'xl' },
}
