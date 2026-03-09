import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import AgentCard from './AgentCard'

const meta: Meta<typeof AgentCard> = {
    title: 'Common/AgentCard',
    component: AgentCard,
    argTypes: {
        name: {
            description: 'The name of the agent',
            control: {
                type: 'text',
            },
        },
        description: {
            description: 'Description of the card',
            control: {
                type: 'text',
            },
        },
        badgeColor: {
            description: 'Status badge color',
            control: {
                type: 'text',
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof AgentCard>

export const Default: Story = {
    render: (args) => <AgentCard {...args} />,
    args: {
        name: 'John Doe',
        description: 'Available',
        badgeColor: 'var(--feedback-success)',
    },
}

export const WithoutDescription: Story = {
    render: (args) => <AgentCard {...args} />,
    args: {
        name: 'John Doe',
        badgeColor: 'var(--feedback-success)',
    },
}
