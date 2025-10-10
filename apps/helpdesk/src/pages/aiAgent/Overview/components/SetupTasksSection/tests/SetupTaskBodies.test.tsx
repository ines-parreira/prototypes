import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'

import { StoreConfiguration } from 'models/aiAgent/types'
import AiAgentStoreConfigurationContext from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { mockStore } from 'utils/testing'

import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableAIAgentOnEmailBody,
    EnableAskAnythingBody,
    EnableSuggestedProductsBody,
    EnableTriggerOnSearchBody,
    MonitorAiAgentBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from '../SetupTaskBodies'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            deployEmail: '/mock/deploy-email-route',
            deployChat: '/mock/deploy-chat-route',
        },
    }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}))

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: jest.fn(() => ({
            data: [],
            isLoading: false,
        })),
    }),
)

describe('SetupTaskBodies', () => {
    describe('VerifyEmailDomainBody', () => {
        it('should render description and button', () => {
            render(<VerifyEmailDomainBody />)

            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Verify' }),
            ).toBeInTheDocument()
        })
    })

    describe('UpdateShopifyPermissionsBody', () => {
        it('should render description and button', () => {
            render(<UpdateShopifyPermissionsBody />)

            expect(
                screen.getByText(
                    'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).toBeInTheDocument()
        })
    })

    describe('EnableTriggerOnSearchBody', () => {
        it('should render description and toggle', () => {
            render(<EnableTriggerOnSearchBody />)

            expect(
                screen.getByText(
                    'Guide shoppers to right products by having AI Agent start a conversation after they use search.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('EnableSuggestedProductsBody', () => {
        it('should render description and toggle', () => {
            render(<EnableSuggestedProductsBody />)

            expect(
                screen.getByText(
                    'Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('EnableAskAnythingBody', () => {
        it('should render description and toggle', () => {
            render(<EnableAskAnythingBody />)

            expect(
                screen.getByText(
                    'Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })

    describe('CreateAnActionBody', () => {
        it('should render description and button', () => {
            render(<CreateAnActionBody />)

            expect(
                screen.getByText(
                    'Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create' }),
            ).toBeInTheDocument()
        })
    })

    describe('MonitorAiAgentBody', () => {
        it('should render description and button', () => {
            render(<MonitorAiAgentBody />)

            expect(
                screen.getByText(
                    'Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Review' }),
            ).toBeInTheDocument()
        })
    })

    describe('EnableAIAgentOnChatBody', () => {
        it('should render description and toggle', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredChatIntegrations: [],
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnChatBody />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            expect(
                screen.getByText(
                    'Start automating conversations on chat to save time and provide faster, more personalized responses to your customers.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })

        it('should initialize toggle state based on chatChannelDeactivatedDatetime', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredChatIntegrations: [],
                chatChannelDeactivatedDatetime: null,
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnChatBody
                                shopName="test-shop"
                                shopType="shopify"
                            />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            expect(toggle).toBeChecked()
        })

        it('should initialize toggle state as off when chatChannelDeactivatedDatetime is set', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredChatIntegrations: [],
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnChatBody
                                shopName="test-shop"
                                shopType="shopify"
                            />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            expect(toggle).not.toBeChecked()
        })

        it('should call updateStoreConfiguration when toggle is clicked', async () => {
            const store = mockStore({})
            const mockUpdateStoreConfiguration = jest.fn().mockResolvedValue({})
            const mockStoreConfiguration = {
                monitoredChatIntegrations: [],
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnChatBody
                                shopName="test-shop"
                                shopType="shopify"
                            />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            await userEvent.click(toggle)

            expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
        })

        it('should handle errors when updateStoreConfiguration fails', async () => {
            const store = mockStore({})
            const mockUpdateStoreConfiguration = jest
                .fn()
                .mockRejectedValue(new Error('Update failed'))
            const mockStoreConfiguration = {
                monitoredChatIntegrations: [],
                chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnChatBody
                                shopName="test-shop"
                                shopType="shopify"
                            />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            await userEvent.click(toggle)

            expect(mockUpdateStoreConfiguration).toHaveBeenCalled()

            consoleErrorSpy.mockRestore()
        })
    })

    describe('EnableAIAgentOnEmailBody', () => {
        it('should render description and toggle', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredEmailIntegrations: [],
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnEmailBody />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            expect(
                screen.getByText(
                    'Start automating conversations on email to save time and provide faster, more personalized responses to your customers.',
                ),
            ).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })

        it('should initialize toggle state based on emailChannelDeactivatedDatetime', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredEmailIntegrations: [],
                emailChannelDeactivatedDatetime: null,
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnEmailBody shopName="test-shop" />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            expect(toggle).toBeChecked()
        })

        it('should initialize toggle state as off when emailChannelDeactivatedDatetime is set', () => {
            const store = mockStore({})
            const mockStoreConfiguration = {
                monitoredEmailIntegrations: [],
                emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnEmailBody shopName="test-shop" />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            expect(toggle).not.toBeChecked()
        })

        it('should call updateStoreConfiguration when toggle is clicked', async () => {
            const store = mockStore({})
            const mockUpdateStoreConfiguration = jest.fn().mockResolvedValue({})
            const mockStoreConfiguration = {
                monitoredEmailIntegrations: [],
                emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnEmailBody shopName="test-shop" />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            await userEvent.click(toggle)

            expect(mockUpdateStoreConfiguration).toHaveBeenCalled()
        })

        it('should handle errors when updateStoreConfiguration fails', async () => {
            const store = mockStore({})
            const mockUpdateStoreConfiguration = jest
                .fn()
                .mockRejectedValue(new Error('Update failed'))
            const mockStoreConfiguration = {
                monitoredEmailIntegrations: [],
                emailChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
            } as unknown as StoreConfiguration

            const mockContextValue = {
                storeConfiguration: mockStoreConfiguration,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            }

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            render(
                <Provider store={store}>
                    <Router history={createMemoryHistory()}>
                        <AiAgentStoreConfigurationContext.Provider
                            value={mockContextValue}
                        >
                            <EnableAIAgentOnEmailBody shopName="test-shop" />
                        </AiAgentStoreConfigurationContext.Provider>
                    </Router>
                </Provider>,
            )

            const toggle = screen.getByRole('switch')
            await userEvent.click(toggle)

            expect(mockUpdateStoreConfiguration).toHaveBeenCalled()

            consoleErrorSpy.mockRestore()
        })
    })

    describe('Component structure', () => {
        it('should apply consistent CSS class to all task bodies', () => {
            const { container: container1 } = render(<VerifyEmailDomainBody />)
            const { container: container2 } = render(
                <UpdateShopifyPermissionsBody />,
            )
            const { container: container3 } = render(
                <EnableTriggerOnSearchBody />,
            )

            expect(
                container1.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
            expect(
                container2.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
            expect(
                container3.querySelector('.setupTaskBodies'),
            ).toBeInTheDocument()
        })

        it('should wrap description text in setupTaskDescription div', () => {
            const { container } = render(<VerifyEmailDomainBody />)

            const descriptionDiv = container.querySelector(
                '.setupTaskDescription',
            )
            expect(descriptionDiv).toBeInTheDocument()
            expect(descriptionDiv).toHaveTextContent(
                'Ensure customers receive emails from the AI Agent by verifying your domain.',
            )
        })
    })

    describe('Component consistency', () => {
        const testCases = [
            {
                Component: VerifyEmailDomainBody,
                description:
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                buttonText: 'Verify',
                hasButton: true,
            },
            {
                Component: UpdateShopifyPermissionsBody,
                description:
                    'Update Shopify permissions to give AI Agent to information about your customers, orders and products.',
                buttonText: 'Update',
                hasButton: true,
            },
            {
                Component: EnableTriggerOnSearchBody,
                description:
                    'Guide shoppers to right products by having AI Agent start a conversation after they use search.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: EnableSuggestedProductsBody,
                description:
                    'Show dynamic, AI-generated questions on product pages to address common shopper questions. Brands that enable this feature see a significant lift in conversions.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: EnableAskAnythingBody,
                description:
                    'Transform your chat bubble into a persistent input bar that invites shoppers to ask questions anytime. Encourage engagement by keeping support top-of-mind while shoppers browse.',
                buttonText: undefined,
                hasButton: false,
            },
            {
                Component: CreateAnActionBody,
                description:
                    'Allow AI Agent to perform support tasks with your third-party apps, such as canceling orders, editing shipping addresses, and more.',
                buttonText: 'Create',
                hasButton: true,
            },
            {
                Component: MonitorAiAgentBody,
                description:
                    'Give feedback on AI Agent interactions to improve its accuracy and response quality for future customer requests.',
                buttonText: 'Review',
                hasButton: true,
            },
        ]

        testCases.forEach(
            ({ Component, description, buttonText, hasButton }) => {
                it(`should have consistent structure for ${Component.name}`, () => {
                    const history = createMemoryHistory()
                    const { container } = render(
                        <Router history={history}>
                            <Component />
                        </Router>,
                    )

                    const mainContainer =
                        container.querySelector('.setupTaskBodies')
                    expect(mainContainer).toBeInTheDocument()

                    const descriptionContainer = container.querySelector(
                        '.setupTaskDescription',
                    )
                    expect(descriptionContainer).toBeInTheDocument()

                    expect(screen.getByText(description)).toBeInTheDocument()

                    if (hasButton && buttonText) {
                        const button = screen.getByRole('button', {
                            name: buttonText,
                        })
                        expect(button).toBeInTheDocument()
                        expect(button.tagName).toBe('BUTTON')
                    } else {
                        expect(screen.getByRole('switch')).toBeInTheDocument()
                    }
                })
            },
        )
    })

    describe('Button navigation', () => {
        it('should navigate to featureUrl when Verify button is clicked', async () => {
            const history = createMemoryHistory()
            const featureUrl = '/app/settings/channels/email/123/verification'

            render(
                <Router history={history}>
                    <VerifyEmailDomainBody featureUrl={featureUrl} />
                </Router>,
            )

            const button = screen.getByRole('button', { name: /verify/i })
            await userEvent.click(button)

            expect(history.location.pathname).toBe(
                '/app/settings/channels/email/123/verification',
            )
        })

        it('should navigate to featureUrl when Update button is clicked', async () => {
            const history = createMemoryHistory()
            const featureUrl = '/app/settings/shopify'

            render(
                <Router history={history}>
                    <UpdateShopifyPermissionsBody featureUrl={featureUrl} />
                </Router>,
            )

            const button = screen.getByRole('button', { name: /update/i })
            await userEvent.click(button)

            expect(history.location.pathname).toBe('/app/settings/shopify')
        })

        it('should navigate to featureUrl when Create button is clicked', async () => {
            const history = createMemoryHistory()
            const featureUrl = '/app/ai-agent/actions'

            render(
                <Router history={history}>
                    <CreateAnActionBody featureUrl={featureUrl} />
                </Router>,
            )

            const button = screen.getByRole('button', { name: /create/i })
            await userEvent.click(button)

            expect(history.location.pathname).toBe('/app/ai-agent/actions')
        })

        it('should not navigate when featureUrl is not provided', async () => {
            const history = createMemoryHistory()
            history.push('/current-page')

            render(
                <Router history={history}>
                    <VerifyEmailDomainBody />
                </Router>,
            )

            const button = screen.getByRole('button', { name: /verify/i })
            await userEvent.click(button)

            expect(history.location.pathname).toBe('/current-page')
        })
    })
})
