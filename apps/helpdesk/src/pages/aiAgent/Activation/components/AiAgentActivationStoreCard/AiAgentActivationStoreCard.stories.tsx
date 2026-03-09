import { Map } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { user } from 'fixtures/users'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import { AlertType } from 'pages/common/components/Alert/Alert'

import type {
    Settings,
    StoreActivation,
} from '../../hooks/storeActivationReducer'
import { KNOWLEDGE_ALERT_KIND } from '../../hooks/storeActivationReducer'
import { AiAgentActivationStoreCard } from './AiAgentActivationStoreCard'

const meta: Meta<typeof AiAgentActivationStoreCard> = {
    title: 'AI Agent/Activation/ActivationStoreCard',
    component: AiAgentActivationStoreCard,
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

type Story = StoryObj<typeof AiAgentActivationStoreCard>

const defaultStoreConfiguration: StoreConfiguration = {
    storeName: 'steve-madden',
    shopType: 'shopify',
    scopes: [AiAgentScope.Sales, AiAgentScope.Support],
} as StoreConfiguration

const getStoreActivation = ({
    alerts,
    settings,
}: {
    alerts?: StoreActivation['alerts']
    settings: Settings
}): StoreActivation => {
    return {
        name: 'steve-madden',
        title: 'Steve Madden',
        alerts: alerts ?? [],
        configuration: defaultStoreConfiguration,
        isMissingKnowledge: false,
        ...settings,
    }
}

export const AllDisabled: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
            settings: {
                sales: {
                    enabled: false,
                    isDisabled: true,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllDisabledMissingIntegration: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
            settings: {
                sales: {
                    enabled: false,
                    isDisabled: true,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllDisabledWithAlert: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
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
                    enabled: false,
                    isDisabled: true,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}

export const SupportEmail: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
            settings: {
                sales: {
                    enabled: false,
                    isDisabled: true,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}

export const SupportEmailChat: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
            settings: {
                sales: {
                    enabled: false,
                    isDisabled: false,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}

export const AllActivated: Story = {
    render: (args) => <AiAgentActivationStoreCard {...args} />,
    args: {
        store: getStoreActivation({
            settings: {
                sales: {
                    enabled: true,
                    isDisabled: false,
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
        }),
        onChatChange: action('onToggle > Support > Chat'),
        onEmailChange: action('onToggle > Support > Email'),
    },
}
