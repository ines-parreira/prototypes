import React from 'react'

import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'

import { AlertType } from 'pages/common/components/Alert/Alert'

import { AiAgentActivationStoreCard } from './AiAgentActivationStoreCard'

const meta: Meta<typeof AiAgentActivationStoreCard> = {
    title: 'AI Agent/Activation/ActivationStoreCard',
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

export const AllDisabled: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: true,
                enabled: false,
            },
            support: {
                enabled: false,
                chat: {
                    enabled: false,
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: false,
                    isIntegrationMissing: false,
                },
            },
        },
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
        alerts: [],
    },
}

export const AllDisabledMissingIntegration: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: true,
                enabled: false,
            },
            support: {
                enabled: false,
                chat: {
                    enabled: false,
                    isIntegrationMissing: true,
                },
                email: {
                    enabled: false,
                    isIntegrationMissing: true,
                },
            },
        },
        alerts: [],
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
    },
}

export const AllDisabledWithAlert: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: true,
                enabled: false,
            },
            support: {
                enabled: false,
                chat: {
                    enabled: false,
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: false,
                    isIntegrationMissing: false,
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
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
    },
}

export const SupportEmail: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: true,
                enabled: false,
            },
            support: {
                enabled: true,
                chat: {
                    enabled: false,
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: true,
                    isIntegrationMissing: false,
                },
            },
        },
        alerts: [],
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
    },
}

export const SupportEmailChat: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: false,
                enabled: false,
            },
            support: {
                enabled: true,
                chat: {
                    enabled: true,
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: true,
                    isIntegrationMissing: false,
                },
            },
        },
        alerts: [],
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
    },
}

export const AllActivated: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: {
            name: 'steve-madden',
            title: 'Steve Madden',
            sales: {
                isDisabled: false,
                enabled: true,
            },
            support: {
                enabled: true,
                chat: {
                    enabled: true,
                    isIntegrationMissing: false,
                },
                email: {
                    enabled: true,
                    isIntegrationMissing: false,
                },
            },
        },
        alerts: [],
        onToggleSales: action('onToggle > Sales'),
        onToggleSupport: action('onToggle > Support'),
        onToggleSupportChat: action('onToggle > Support > Chat'),
        onToggleSupportEmail: action('onToggle > Support > Email'),
    },
}
