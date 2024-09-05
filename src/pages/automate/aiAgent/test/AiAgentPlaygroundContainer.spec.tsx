import React from 'react'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {RootState} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import {AccountConfiguration, StoreConfiguration} from 'models/aiAgent/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {AiAgentPlaygroundContainer} from '../AiAgentPlaygroundContainer'
import {usePublicResources} from '../hooks/usePublicResources'
import {usePlaygroundMessages} from '../hooks/usePlaygroundMessages'
import {useGetOrCreateSnippetHelpCenter} from '../hooks/useGetOrCreateSnippetHelpCenter'

const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const defaultState: Partial<RootState> = {
    currentUser: fromJS(user),
    currentAccount: fromJS(account),
}

jest.mock('models/aiAgent/queries')
const mockUseGetStoreConfigurationPure = assumeMock(
    useGetStoreConfigurationPure
)
const mockUseGetAccountConfiguration = assumeMock(useGetAccountConfiguration)

jest.mock('../hooks/usePublicResources')
const mockUsePublicResources = assumeMock(usePublicResources)

jest.mock('../hooks/usePlaygroundMessages')
const mockUsePlaygroundMessages = assumeMock(usePlaygroundMessages)

jest.mock('../hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = jest.mocked(
    useGetOrCreateSnippetHelpCenter
)

const storeConfiguration: StoreConfiguration = {
    deactivatedDatetime: null,
    trialModeActivatedDatetime: '2024-07-30T12:33:02.750Z',
    storeName: 'test-shop',
    helpCenterId: 1,
    snippetHelpCenterId: 1,
    guidanceHelpCenterId: 1,
    toneOfVoice: 'Friendly',
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
    signature: 'This response was created by AI',
    excludedTopics: [],
    tags: [],
    conversationBot: {
        id: 1,
        email: 'test@mail.com',
    },
    monitoredEmailIntegrations: [{id: 1000, email: 'foo@bar.com'}],
    silentHandover: false,
    ticketSampleRate: 100,
    dryRun: false,
    isDraft: false,
    monitoredChatIntegrations: [],
}

const accountConfiguration: AccountConfiguration = {
    accountId: 10,
    gorgiasDomain: 'my-domain',
    helpdeskOAuth: null,
    httpIntegration: {
        id: 1000,
    },
}

describe('AiAgentPlayground', () => {
    it('renders loader if data is fetching', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('renders loader if public resources are fetching', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        helpCenterId: null,
                        monitoredEmailIntegrations: [],
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: true,
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('renders alert of missing email and knowledge if there is no account configuration', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {data: {storeConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'Your email and knowledge settings must be saved to use test mode. Click save in settings to proceed.'
            )
        ).toBeInTheDocument()
    })

    it('renders email alert there is no store configuration but there is a snippet help center with public sources', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [{status: 'done', id: 60}],
            isSourceItemsListLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'At least one email must be connected to AI Agent to use test mode.'
            )
        ).toBeInTheDocument()
    })

    it('renders alert of missing email and knowledge if there is no store configuration and snippet help center', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'Your email and knowledge settings must be saved to use test mode. Click save in settings to proceed.'
            )
        ).toBeInTheDocument()
    })

    it('renders alert of missing email and knowledge if there is neither email nor knowledge', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        helpCenterId: null,
                        monitoredEmailIntegrations: [],
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'Your email and knowledge settings must be saved to use test mode. Click save in settings to proceed.'
            )
        ).toBeInTheDocument()
    })

    it('renders alert of missing knowledge if there is no knowledge but there is an email', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        helpCenterId: null,
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'At least one knowledge source is required to use test mode.'
            )
        ).toBeInTheDocument()
    })

    it('renders alert of missing email if there is no email but there is a help center', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        monitoredEmailIntegrations: [],
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'At least one email must be connected to AI Agent to use test mode.'
            )
        ).toBeInTheDocument()
    })

    it('renders alert of missing email if there is no email but there are public resources', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration: {
                        ...storeConfiguration,
                        helpCenterId: null,
                        monitoredEmailIntegrations: [],
                    },
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [{status: 'done', id: 60}],
            isSourceItemsListLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AiAgentPlaygroundContainer />
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(
            screen.getByText(
                (_, element) =>
                    element?.textContent ===
                    'At least one email must be connected to AI Agent to use test mode.'
            )
        ).toBeInTheDocument()
    })

    it('renders playground if both email and knowledge are present', () => {
        mockUseGetStoreConfigurationPure.mockReturnValue({
            data: {
                data: {
                    storeConfiguration,
                },
            },
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetStoreConfigurationPure>)

        mockUseGetAccountConfiguration.mockReturnValue({
            data: {data: {accountConfiguration}},
            error: undefined,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetAccountConfiguration>)

        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: {id: 1},
        } as unknown as ReturnType<typeof useGetOrCreateSnippetHelpCenter>)

        mockUsePublicResources.mockReturnValue({
            sourceItems: [{status: 'done', id: 60}],
            isSourceItemsListLoading: false,
        })

        mockUsePlaygroundMessages.mockReturnValue({
            messages: [],
            isMessageSending: false,
            onMessageSend: jest.fn(),
            onNewConversation: jest.fn(),
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <AiAgentPlaygroundContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: `/app/automation/:shopType/:shopName/ai-agent/test`,
                route: '/app/automation/shopify/gorgias-product-demo/ai-agent/test',
            }
        )

        expect(screen.getByText('New Conversation')).toBeInTheDocument()
    })
})
