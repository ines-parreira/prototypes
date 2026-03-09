import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { user } from 'fixtures/users'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import { LegacyAiAgentActivationStoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/LegacyAiAgentActivationStoreCard'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { KNOWLEDGE_ALERT_KIND } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { AlertType } from 'pages/common/components/Alert/Alert'

const meta: Meta<typeof LegacyAiAgentActivationStoreCard> = {
    title: 'AI Agent/Activation/LegacyActivationStoreCard',
    component: LegacyAiAgentActivationStoreCard,
    args: {},
    decorators: [
        (Story) => (
            <Provider store={configureMockStore()({ currentUser: Map(user) })}>
                <MemoryRouter initialEntries={['/']}>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
}

export default meta

type Story = StoryObj<typeof LegacyAiAgentActivationStoreCard>

const defaultStoreConfiguration: StoreConfiguration = {
    storeName: 'steve-madden',
    shopType: 'shopify',
    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
} as StoreConfiguration

export const AllDisabled: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            settings: {
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
            alerts: [],
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllDisabledMissingIntegration: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            settings: {
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
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllDisabledWithAlert: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            alerts: [
                {
                    type: AlertType.Warning,
                    kind: KNOWLEDGE_ALERT_KIND,
                    message:
                        'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                    cta: { label: 'Visit Knowledge', to: '/' },
                },
            ],
            settings: {
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
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}

export const SupportEmail: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            settings: {
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
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}

export const SupportEmailChat: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            settings: {
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
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllActivated: Story = {
    render: (args) => <LegacyAiAgentActivationStoreCard {...args} />,
    args: {
        store: storeActivationFixture({
            storeName: 'steve-madden',
            settings: {
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
            configuration: defaultStoreConfiguration,
        }),
        onSalesChange: action('onToggle > Sales'),
        onSupportChange: action('onToggle > Support'),
        onSupportChatChange: action('onToggle > Support > Chat'),
        onSupportEmailChange: action('onToggle > Support > Email'),
    },
}
