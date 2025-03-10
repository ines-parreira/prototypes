import React from 'react'

import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { AlertType } from 'pages/common/components/Alert/Alert'

import { AiAgentActivationStoreCard } from './AiAgentActivationStoreCard'

const meta: Meta<typeof AiAgentActivationStoreCard> = {
    title: 'AI Agent/Activation/StoreCard',
    component: AiAgentActivationStoreCard,
    args: {},
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <Story />
            </MemoryRouter>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof AiAgentActivationStoreCard>

export const AiAgentActivationStoreCardDefault: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                enabled: false,
                onToggle: () => {},
            },
            support: {
                onToggle: () => {},
                chat: {
                    enabled: false,
                    onToggle: () => {},
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: false,
                    onToggle: () => {},
                    isIntegrationMissing: true,
                },
            },
        },
        alerts: [
            {
                type: AlertType.Warning,
                message:
                    'At least one knowledge source required. Update in “Knowledge” to be able to activate AI Agent.',
                cta: { label: 'Visit Knowledge', to: '/' },
            },
        ],
    },
}
