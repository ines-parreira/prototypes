import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { TicketChannel } from 'business/types/ticket'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import type {
    ContactForm,
    ContactFormAutomationSettings,
} from 'models/contactForm/types'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormsAutomationSettings'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import OrderManagementPreviewContext from '../OrderManagementPreviewContext'
import OrderManagementView from '../OrderManagementView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock('pages/automate/common/hooks/useContactFormsAutomationSettings')
jest.mock('@repo/logging')
jest.mock('@repo/feature-flags')
jest.mock('hooks/aiAgent/useAiAgentAccess')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseAiAgentAccess = useAiAgentAccess as jest.MockedFunction<
    typeof useAiAgentAccess
>
const mockUseSelfServiceConfiguration =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >
const mockUseApplicationsAutomationSettings =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >
const mockUseContactFormsAutomationSettings =
    useContactFormsAutomationSettings as jest.MockedFunction<
        typeof useContactFormsAutomationSettings
    >

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'shop-name',
                meta: {},
            },
        ],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {},
        },
        chatsApplicationAutomationSettings: {},
    },
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.plan_id,
            },
            status: 'active',
        },
    }),
} as unknown as RootState

const renderComponent = (
    state = defaultState,
    path = '/a/1/automate/order-management/integrations/shopify/test-shop',
) => {
    const history = createMemoryHistory({ initialEntries: [path] })
    const channels: SelfServiceChannel[] = [
        {
            type: TicketChannel.Chat,
            value: {
                id: 1,
                type: IntegrationType.GorgiasChat,
                meta: { app_id: 'app-1' },
            } as GorgiasChatIntegration,
        },
        {
            type: TicketChannel.ContactForm,
            value: {
                id: 2,
            } as ContactForm,
        },
    ]

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <Router history={history}>
                    <OrderManagementPreviewContext.Provider
                        value={{
                            channels,
                            channel: undefined,
                            onChannelChange: jest.fn(),
                        }}
                    >
                        <OrderManagementView />
                    </OrderManagementPreviewContext.Provider>
                </Router>
            </Provider>
        </QueryClientProvider>,
        { history },
    )
}

describe('<OrderManagementView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation((key) => {
            if (key === FeatureFlagKey.ChangeAutomateSettingButtomPosition) {
                return true
            }
            return false
        })
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseSelfServiceConfiguration.mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: { id: 1 } as ShopifyIntegration,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: jest.fn(() =>
                Promise.resolve(),
            ),
        })
        mockUseApplicationsAutomationSettings.mockReturnValue({
            applicationsAutomationSettings: {
                'app-1': {} as ChatApplicationAutomationSettings,
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(() =>
                Promise.resolve(),
            ),
        })
        mockUseContactFormsAutomationSettings.mockReturnValue({
            contactFormsAutomationSettings: {
                '2': {} as ContactFormAutomationSettings,
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleContactFormAutomationSettingsFetch: jest.fn(() =>
                Promise.resolve(),
            ),
            handleContactFormAutomationSettingsUpdate: jest.fn(() =>
                Promise.resolve(),
            ),
        })
    })

    describe('feature flag tracking', () => {
        it('should call useFlag with ChangeAutomateSettingButtomPosition flag', () => {
            renderComponent()

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.ChangeAutomateSettingButtomPosition,
            )
        })

        it('should log AutomateSettingPageViewed event when flag is enabled', async () => {
            renderComponent()

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AutomateSettingPageViewed,
                    {
                        page: 'Order Management',
                    },
                )
            })
        })

        it('should not log AutomateSettingPageViewed event when flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Track order')).toBeInTheDocument()
            })

            expect(mockLogEvent).not.toHaveBeenCalled()
        })

        it('should log event only once on mount when flag is enabled', async () => {
            const { rerender, history } = renderComponent()

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledTimes(1)
            })

            const channels: SelfServiceChannel[] = [
                {
                    type: TicketChannel.Chat,
                    value: {
                        id: 1,
                        type: IntegrationType.GorgiasChat,
                        meta: { app_id: 'app-1' },
                    } as GorgiasChatIntegration,
                },
                {
                    type: TicketChannel.ContactForm,
                    value: {
                        id: 2,
                    } as ContactForm,
                },
            ]

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <Router history={history}>
                            <OrderManagementPreviewContext.Provider
                                value={{
                                    channels,
                                    channel: undefined,
                                    onChannelChange: jest.fn(),
                                }}
                            >
                                <OrderManagementView />
                            </OrderManagementPreviewContext.Provider>
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('component rendering', () => {
        it('should render loading state when selfServiceConfiguration is undefined', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: undefined,
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(screen.queryByText('Track order')).not.toBeInTheDocument()
        })

        it('should render all order management flow items', () => {
            renderComponent()

            expect(screen.getByText('Track order')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Allow customers to view order tracking information.',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Return order')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Allow customers to request returns based on custom criteria.',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Cancel order')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Allow customers to request order cancellations based on custom criteria.',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Report order issue')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Allow customers to report order issues based on custom scenarios.',
                ),
            ).toBeInTheDocument()
        })

        it('should render description and help link', () => {
            renderComponent()

            expect(
                screen.getByText(
                    /let customers track and manage orders in chat/i,
                ),
            ).toBeInTheDocument()

            const helpLink = screen.getByRole('link', {
                name: /how to set up order management/i,
            })
            expect(helpLink).toHaveAttribute(
                'href',
                'https://docs.gorgias.com/en-US/installing-self-service-81861',
            )
        })
    })

    describe('AI Agent access control', () => {
        it('should show subscription action for track order when user has no access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderComponent()

            const subscriptionButtons = screen.getAllByRole('button', {
                name: /get ai agent features/i,
            })
            expect(subscriptionButtons).toHaveLength(2)
        })

        it('should not navigate when clicking track order item without access', async () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { history } = renderComponent()
            const initialPath = history.location.pathname

            const trackOrderItem = screen.getByText('Track order')
            await userEvent.click(trackOrderItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toBe(initialPath)
            })
        })

        it('should not navigate when clicking report issue item without access', async () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { history } = renderComponent()
            const initialPath = history.location.pathname

            const reportIssueItem = screen.getByText('Report order issue')
            await userEvent.click(reportIssueItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toBe(initialPath)
            })
        })

        it('should not show alert when user has no access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: true,
                        unfulfilledMessage: {
                            html: '',
                            text: '',
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.queryByText(/no response configured/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('should navigate to track order flow when clicking track order item', async () => {
            const { history } = renderComponent()

            const trackOrderItem = screen.getByText('Track order')
            await userEvent.click(trackOrderItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toContain('track')
            })
        })

        it('should navigate to return order flow when clicking return order item', async () => {
            const { history } = renderComponent()

            const returnOrderItem = screen.getByText('Return order')
            await userEvent.click(returnOrderItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toContain('return')
            })
        })

        it('should navigate to cancel order flow when clicking cancel order item', async () => {
            const { history } = renderComponent()

            const cancelOrderItem = screen.getByText('Cancel order')
            await userEvent.click(cancelOrderItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toContain('cancel')
            })
        })

        it('should navigate to report issue flow when clicking report issue item', async () => {
            const { history } = renderComponent()

            const reportIssueItem = screen.getByText('Report order issue')
            await userEvent.click(reportIssueItem.closest('div')!)

            await waitFor(() => {
                expect(history.location.pathname).toContain('report-issue')
            })
        })

        it('should not show title when in automate settings path', () => {
            renderComponent(
                defaultState,
                '/app/settings/automate/order-management',
            )

            expect(
                screen.queryByText('Order Management'),
            ).not.toBeInTheDocument()
        })
    })

    describe('flow toggle functionality', () => {
        it('should call handleSelfServiceConfigurationUpdate when toggling flow', async () => {
            const handleUpdate = jest.fn(() => Promise.resolve())
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: true,
                        unfulfilledMessage: {
                            html: 'test',
                            text: 'test',
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: handleUpdate,
            })

            renderComponent()

            const toggles = screen.getAllByRole('switch')
            expect(toggles[0]).toHaveAttribute('aria-checked', 'true')

            await userEvent.click(toggles[0])

            await waitFor(() => {
                expect(handleUpdate).toHaveBeenCalled()
            })
        })
    })

    describe('alert validation', () => {
        it('should show alert for track order when response message is empty and flow is enabled', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: true,
                        unfulfilledMessage: {
                            html: '',
                            text: '',
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.getByText(/no response configured/i),
            ).toBeInTheDocument()
        })

        it('should show alert for return order when response message is empty and flow is enabled', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    returnOrderPolicy: {
                        enabled: true,
                        eligibilities: [],
                        exceptions: [],
                        action: {
                            type: ReturnActionType.AutomatedResponse,
                            responseMessageContent: {
                                html: '',
                                text: '',
                            },
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.getByText(/no response configured/i),
            ).toBeInTheDocument()
        })

        it('should show alert for cancel order when response message is empty and flow is enabled', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    cancelOrderPolicy: {
                        enabled: true,
                        eligibilities: [],
                        exceptions: [],
                        action: {
                            type: 'automated_response',
                            responseMessageContent: {
                                html: '',
                                text: '',
                            },
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.getByText(/no response configured/i),
            ).toBeInTheDocument()
        })

        it('should show alert for report issue when response message is empty and flow is enabled', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    reportIssuePolicy: {
                        enabled: true,
                        cases: [
                            {
                                title: 'Case 1',
                                description: 'Case 1',
                                conditions: {},
                                newReasons: [
                                    {
                                        reasonKey: 'reason_1',
                                        action: {
                                            showHelpfulPrompt: false,
                                            type: 'automated_response',
                                            responseMessageContent: {
                                                html: '',
                                                text: '',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.getByText(/no response configured/i),
            ).toBeInTheDocument()
        })

        it('should not show alert when flow is disabled', () => {
            mockUseSelfServiceConfiguration.mockReturnValue({
                isFetchPending: false,
                isUpdatePending: false,
                storeIntegration: undefined,
                selfServiceConfiguration: {
                    ...mockSelfServiceConfiguration,
                    trackOrderPolicy: {
                        enabled: false,
                        unfulfilledMessage: {
                            html: '',
                            text: '',
                        },
                    },
                },
                handleSelfServiceConfigurationUpdate: jest.fn(() =>
                    Promise.resolve(),
                ),
            })

            renderComponent()

            expect(
                screen.queryByText(/no response configured/i),
            ).not.toBeInTheDocument()
        })
    })
})
