import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { TypingActivityProps } from './TypingActivity'
import TypingActivity from './TypingActivity'

const storyConfig: Meta<typeof TypingActivity> = {
    title: 'Chat/TypingActivity',
    component: TypingActivity,
}

type Story = StoryObj<typeof TypingActivity>

const Template: Story = {
    render: ({ name, isTyping }) => (
        <TypingActivity name={name} isTyping={isTyping} />
    ),
}

const defaultProps: Partial<TypingActivityProps> = {
    name: 'Customer',
    isTyping: true,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithCustomerName = {
    ...Template,
    args: { ...defaultProps, name: 'Toni' },
}

export const NotTyping = {
    ...Template,
    args: { ...defaultProps, isTyping: false },
}

export default storyConfig
