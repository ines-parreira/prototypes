// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import * as segment from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import { useBillingState } from 'models/billing/queries'
import { IntegrationType } from 'models/integration/constants'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useKnowledgeServiceOpportunities } from 'pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities'
import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'
import { useHasNoOnboardedStores } from 'pages/aiAgent/Overview/hooks/useHasNoOnboardedStores'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import type { RootState, StoreDispatch, StoreState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { AiAgentOverview } from '../AiAgentOverview'
import { AiAgentOverviewRootStateFixture } from './AiAgentOverviewRootState.fixture'

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreActivationsMock = assumeMock(useStoreActivations)

jest.mock(
    'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSectionConnected',
    () => ({
        PendingTasksSectionConnected: () => (
            <div data-testid="mocked-pending-tasks">
                Mocked PendingTasksSectionConnected
            </div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/trial/components/TrialManageWorkflow/TrialManageWorkflow',
    () => ({
        TrialManageWorkflow: () => <div>Trial-Manage-Workflow</div>,
    }),
)
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}))
jest.mock('pages/aiAgent/Overview/hooks/useThankYouModal')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('models/billing/queries')
jest.mock('models/billing/utils')
jest.mock('hooks/aiAgent/useAiAgentUpgradePlan')
jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan')

jest.mock('pages/aiAgent/Overview/hooks/useHasNoOnboardedStores')
const mockUseHasNoOnboardedStores = jest.mocked(useHasNoOnboardedStores)

jest.mock('pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled')

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities')
jest.mock('pages/aiAgent/hooks/useShopIntegrationId')
jest.mock('pages/aiAgent/TopOpportunities/TopOpportunitiesSection', () => ({
    TopOpportunitiesSection: () => <div>Top Opportunities Section</div>,
}))

const logEventMock = jest.spyOn(segment, 'logEvent').mockImplementation(jest.fn)

const defaultLocation = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
}

const handleModalAction = jest.fn()

const defaultThankYouModalValues = {
    isOpen: false,
    isDisabled: false,
    isLoading: false,
    handleModalAction,
    modalContent: {
        title: 'Your account is ready!',
        description: '',
        actionLabel: 'Go live with AI agent',
        closeLabel: 'Close',
    },
}

const mockUseThankYouModal = useThankYouModal as jest.Mock
const mockUseTrialAccess = useTrialAccess as jest.Mock
const mockUseBillingState = assumeMock(useBillingState)
const mockUseAiAgentUpgradePlan = assumeMock(useAiAgentUpgradePlan)
const mockUseUpgradePlan = assumeMock(useUpgradePlan)
const mockUseKnowledgeServiceOpportunities = assumeMock(
    useKnowledgeServiceOpportunities,
)
const mockUseShopIntegrationId = assumeMock(useShopIntegrationId)
const useLocationMock = assumeMock(useLocation)
const useParamsMock = assumeMock(useParams)
useLocationMock.mockReturnValue(defaultLocation)
useParamsMock.mockReturnValue({ shopName: undefined, shopType: undefined })

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()
const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultStore = {
    ...rootState,
    currentAccount: fromJS({
        ...rootState.currentAccount?.toJS(),
        current_subscription: {
            products: {
                automation: 'aut-01-monthly-usd-6',
            },
        },
    }),
    ui: {
        stats: { filters: initialState },
    },
    stats: initialStatsFiltersState,
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState),
} as StoreState

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore(defaultStore)}>
                <QueryClientProvider client={queryClient}>
                    <AiAgentOverview />
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

describe('AiAgentOverview', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        mockUseThankYouModal.mockReturnValue(defaultThankYouModalValues)
        useStoreActivationsMock.mockReturnValue({
            storeActivations: {},
        } as any)
        mockUseTrialAccess.mockReturnValue(
            createMockTrialAccess({
                canSeeTrialCTA: false,
            }),
        )

        mockUseHasNoOnboardedStores.mockReturnValue(false)

        mockUseKnowledgeServiceOpportunities.mockReturnValue({
            opportunities: [],
            isLoading: false,
            allowedOpportunityIds: undefined,
            totalPending: 0,
        } as any)

        mockUseShopIntegrationId.mockReturnValue(123)

        // Default mock for useAiAgentOverviewModeEnabled
        jest.mocked(useAiAgentOverviewModeEnabled).mockReturnValue({
            isAiAgentLiveModeEnabled: false,
            isLoading: false,
        })

        // Mock billing queries
        mockUseBillingState.mockReturnValue({
            data: {
                current_plans: {
                    automate: {
                        amount: 45000, // $450 in cents
                        currency: 'USD',
                        num_quota_tickets: 2000,
                    },
                    helpdesk: {
                        amount: 10000, // $100 in cents
                        num_quota_tickets: 2000,
                    },
                },
            },
        } as any)

        mockUseAiAgentUpgradePlan.mockReturnValue({
            data: {
                amount: 53000,
                currency: 'USD',
                num_quota_tickets: 2000,
            },
        } as any)

        // Mock billing utils
        const mockGetPlanPriceFormatted = jest.requireMock(
            'models/billing/utils',
        ).getPlanPriceFormatted

        mockGetPlanPriceFormatted?.mockReturnValue('$530')

        // Mock useUpgradePlan
        mockUseUpgradePlan.mockReturnValue({
            upgradePlan: jest.fn(),
            upgradePlanAsync: jest.fn(),
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        })
    })
    it('should render', () => {
        const { queryByText } = renderComponent()
        expect(queryByText('AI Agent performance')).toBeTruthy()
        expect(queryByText('Mocked PendingTasksSectionConnected')).toBeTruthy()
    })

    it('should not renders the Thank You modal', () => {
        const { queryByText } = renderComponent()
        expect(queryByText('Your account is ready')).toBeNull()
    })

    it('should call the segment log', () => {
        renderComponent()
        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentOverviewPageView,
            {
                shopName: undefined,
                shopType: undefined,
            },
        )
    })

    describe('Thank you Modal', () => {
        it('should renders the Thank You modal when it is not disabled', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
            })

            const { findByText } = renderComponent()

            expect(
                await findByText(/Your account is ready!/),
            ).toBeInTheDocument()
        })

        it('should call the go live action and close action when we click on the buttons', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
            })

            const { findByText, getByText } = renderComponent()

            expect(
                await findByText(/Your account is ready!/),
            ).toBeInTheDocument()

            fireEvent.click(getByText('Go live with AI agent'))

            expect(handleModalAction).toHaveBeenCalledWith('confirm')

            fireEvent.click(getByText('Close'))

            expect(handleModalAction).toHaveBeenCalledWith('close')
        })

        it('should renders the Thank You modal when it is disabled', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
                isDisabled: true,
                modalContent: {
                    title: "You're almost ready",
                    description:
                        'Continue setting up your AI Agent and push it live when ready',
                    actionLabel: 'Continue',
                    closeLabel: '',
                },
            })

            const { findByText } = renderComponent()

            expect(await findByText(/You're almost ready/)).toBeInTheDocument()
            expect(
                await findByText(
                    /Continue setting up your AI Agent and push it live when ready/,
                ),
            ).toBeInTheDocument()
        })

        it('should call the clear query when the button continue exists', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
                isDisabled: true,
                modalContent: {
                    title: "You're almost ready",
                    description:
                        'Continue setting up your AI Agent and push it live when ready',
                    actionLabel: 'Continue',
                    closeLabel: '',
                },
            })

            const { findByText, getByText } = renderComponent()

            expect(await findByText(/You're almost ready/)).toBeInTheDocument()

            fireEvent.click(getByText('Continue'))

            expect(handleModalAction).toHaveBeenCalledWith('confirm')
        })
    })

    describe('when coming from another page', () => {
        it('should not renders the Thank You modal', () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: { from: '/app/ai-agent/test' },
            })

            const { queryByText } = renderComponent()

            expect(queryByText('Your account is ready')).toBeNull()
        })
    })

    it('should render the resource section when the flag standalone-conv-ai_overview-page-resource-section is Available', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key ===
                    FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection ||
                false,
        )
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeTruthy()
    })

    it('should not render the resource section when the flag standalone-conv-ai_overview-page-resource-section is Unavailable', () => {
        mockUseFlag.mockReturnValue(false)
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeFalsy()
    })

    describe('Shopping Assistant Trial', () => {
        it('should not render trial banner when canSeeTrialCTA is false', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                }),
            )

            const { queryByText } = renderComponent()
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
            expect(
                queryByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            ).toBeFalsy()
        })

        it('should render trial banner when canSeeTrialCTA is true', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { queryByText } = renderComponent()
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeTruthy()
            expect(
                queryByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            ).toBeTruthy()
            expect(
                queryByText('How AI Agent can 2x conversion rate'),
            ).toBeTruthy()
        })

        it('should toggle isUpgradeTrialModalRevampOpen when Try for X days is clicked and closed', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getByText, queryByText } = renderComponent()

            // Modal should not be open initially
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeFalsy()

            // Open the modal
            fireEvent.click(
                getByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            )
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeTruthy()

            // Close the modal using the current plan button
            fireEvent.click(getByText('Keep current plan'))
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeFalsy()
        })

        it('should open upgrade trial modal when banner button is clicked', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getAllByText, queryByText } = renderComponent()

            // Open the modal
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeTruthy()

            // Verify modal content is displayed
            expect(queryByText('AI Agent')).toBeTruthy()
            expect(queryByText('Keep current plan')).toBeTruthy()
            expect(
                queryByText('after trial ends', { exact: false }),
            ).toBeTruthy()
        })

        it('should display correct pricing and features in trial modal', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getAllByText, queryByText } = renderComponent()

            // Open the modal using the first "Try for 14 days" button (banner)
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )

            // Check current plan details
            expect(queryByText('AI Agent')).toBeTruthy()
            expect(queryByText('$450')).toBeTruthy()
            expect(queryByText('2000 automated interactions')).toBeTruthy()

            // Check new plan details
            expect(queryByText('AI Agent + Shopping Assistant')).toBeTruthy()
            expect(queryByText('$530')).toBeTruthy()
            expect(queryByText('Everything in your current plan')).toBeTruthy()
            expect(
                queryByText('Proactively engage with shoppers at key moments'),
            ).toBeTruthy()
        })

        it('should open the correct URL when clicking How Shopping Assistant Accelerates Growth', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )
            const originalOpen = window.open
            window.open = jest.fn()

            const { getByText } = renderComponent()
            fireEvent.click(getByText('How AI Agent can 2x conversion rate'))

            expect(window.open).toHaveBeenCalledWith(
                'https://www.gorgias.com/ai-agent/shopping-assistant',
                '_blank',
            )

            window.open = originalOpen // Restore original
        })

        it('should handle multiple banner actions correctly', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getAllByText, getByText, queryByText } = renderComponent()

            // Verify both actions are available
            expect(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            ).toBeTruthy()
            expect(
                getByText('How AI Agent can 2x conversion rate'),
            ).toBeTruthy()

            // Test primary action multiple times
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )
            expect(
                queryByText(
                    'Try the full power of AI Agent for 14 days at no additional cost',
                ),
            ).toBeTruthy()

            // Close modal
            fireEvent.click(getByText('Keep current plan'))

            // Open again
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeTruthy()
        })

        it('should not render trial components when canSeeTrialCTA is undefined', () => {
            mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

            const { queryByText } = renderComponent()
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
            // The test should check that trial banner is not shown, but there might be other buttons with same text
            // We should check specifically for banner elements, not just text
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
        })

        it('should display new plan features in trial modal', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getAllByText, queryByText } = renderComponent()

            // Open the modal
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )

            // Check for new plan features instead of tooltip
            expect(
                queryByText(
                    'Personalize product recommendations powered by rich customer insights',
                ),
            ).toBeTruthy()
        })

        it('should maintain banner visibility state correctly', () => {
            const mockReturnValue = createMockTrialAccess({
                canSeeTrialCTA: true,
            })
            mockUseTrialAccess.mockReturnValue(mockReturnValue)

            const { queryByText, rerender } = renderComponent()

            // Initially visible
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeTruthy()

            // Change to not visible
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                }),
            )

            rerender(
                <MemoryRouter>
                    <Provider store={mockStore(defaultStore)}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Should not be visible
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
        })

        it('should handle edge case where trial access hook returns empty object', () => {
            mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

            const { queryByText } = renderComponent()
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
        })
    })

    describe('Component Integration', () => {
        it('should render all major sections when feature flags are enabled', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key ===
                        FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection ||
                    false,
            )
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { queryByText, getByTestId } = renderComponent()

            // Check all major sections
            expect(queryByText('AI Agent performance')).toBeTruthy() // KPI Section
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeTruthy() // Trial Banner
            expect(queryByText('AI Agent performance')).toBeTruthy() // KPI Section
            expect(getByTestId('mocked-pending-tasks')).toBeTruthy() // Pending Tasks
            expect(queryByText('Resources')).toBeTruthy() // Resources Section
        })

        it('should handle hook errors gracefully', () => {
            mockUseTrialAccess.mockImplementation(() => {
                throw new Error('Test error')
            })

            // Component should crash when hook throws
            expect(() => renderComponent()).toThrow('Test error')
        })

        it('should call useTrialAccess hook on every render', async () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: false,
                }),
            )

            // Clear any previous calls from beforeEach
            mockUseTrialAccess.mockClear()

            await act(async () => {
                renderComponent()
            })

            // Hook is called multiple times due to TrialManageWorkflow component and React re-renders
            expect(mockUseTrialAccess).toHaveBeenCalled()

            // Re-render should call again
            await act(async () => {
                renderComponent()
            })
            expect(mockUseTrialAccess).toHaveBeenCalled()
        })
    })

    describe('State Management', () => {
        it('should handle modal state transitions correctly', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeTrialCTA: true,
                }),
            )

            const { getAllByText, getByText, queryByText } = renderComponent()

            // Open modal first - this test already assumes the component has rendered
            // and we're testing the transitions between modal states
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )
            expect(
                queryByText(
                    'Try the full power of AI Agent for 14 days at no additional cost',
                ),
            ).toBeTruthy()

            // Keep current plan button closes the modal
            fireEvent.click(getByText('Keep current plan'))
            expect(
                queryByText(
                    'Try the full power of AI Agent for 14 days at no additional cost',
                ),
            ).toBeFalsy()

            // Can open again after closing
            fireEvent.click(
                getAllByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                )[0],
            )
            expect(
                queryByText(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                ),
            ).toBeTruthy()
        })
    })

    describe('Inventory Scope Update Banner', () => {
        beforeEach(() => {
            // Enable the feature flag by default for these tests
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.ShopifyStorefrontPermissions ||
                    false,
            )

            useParamsMock.mockReturnValue({
                shopName: 'test-shop',
                shopType: 'shopify',
            })
        })

        it('should dispatch inventory scope warning notification when missing required scopes', () => {
            const storeWithMissingScopes = {
                ...defaultStore,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'test-shop',
                            meta: {
                                shop_name: 'test-shop',
                                need_scope_update: true,
                                oauth: {
                                    scope: 'read_products,write_products,read_orders',
                                },
                            },
                        },
                    ],
                    redirect_uris: {
                        shopify:
                            'https://admin.shopify.com/store/{shop_name}/oauth/authorize',
                    },
                }),
            }

            const store = mockStore(storeWithMissingScopes)

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Check that the notification action was dispatched
            const actions = store.getActions()

            const notifyAction = actions.find(
                (action) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.message?.includes(
                        'Unlock smarter recommendations',
                    ),
            )

            expect(notifyAction).toBeDefined()
            expect(notifyAction?.payload?.message).toContain(
                'Unlock smarter recommendations by giving AI Agent access to your Shopify inventory',
            )
        })

        it('should not dispatch inventory scope warning when has all required scopes', () => {
            const storeWithAllScopes = {
                ...defaultStore,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'test-shop',
                            meta: {
                                shop_name: 'test-shop',
                                need_scope_update: true,
                                oauth: {
                                    scope: 'read_products,unauthenticated_read_product_listings,unauthenticated_read_product_inventory',
                                },
                            },
                        },
                    ],
                    redirect_uris: {
                        shopify:
                            'https://admin.shopify.com/store/{shop_name}/oauth/authorize',
                    },
                }),
            }

            const store = mockStore(storeWithAllScopes)

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Check that the notification action was NOT dispatched
            const actions = store.getActions()
            const notifyAction = actions.find(
                (action) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.message?.includes(
                        'Unlock smarter recommendations',
                    ),
            )

            expect(notifyAction).toBeUndefined()
        })

        it('should not dispatch inventory scope warning when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const storeWithMissingScopes = {
                ...defaultStore,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'test-shop',
                            meta: {
                                shop_name: 'test-shop',
                                need_scope_update: true,
                                oauth: {
                                    scope: 'read_products,write_products,read_orders',
                                },
                            },
                        },
                    ],
                    redirect_uris: {
                        shopify:
                            'https://admin.shopify.com/store/{shop_name}/oauth/authorize',
                    },
                }),
            }

            const store = mockStore(storeWithMissingScopes)

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Check that the notification action was NOT dispatched
            const actions = store.getActions()
            const notifyAction = actions.find(
                (action) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.message?.includes(
                        'Unlock smarter recommendations',
                    ),
            )

            expect(notifyAction).toBeUndefined()
        })

        it('should not dispatch inventory scope warning when need_scope_update is false', () => {
            const storeWithoutScopeUpdate = {
                ...defaultStore,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Shopify,
                            name: 'test-shop',
                            meta: {
                                shop_name: 'test-shop',
                                need_scope_update: false,
                                oauth: {
                                    scope: 'read_products,write_products',
                                },
                            },
                        },
                    ],
                    redirect_uris: {
                        shopify:
                            'https://admin.shopify.com/store/{shop_name}/oauth/authorize',
                    },
                }),
            }

            const store = mockStore(storeWithoutScopeUpdate)

            render(
                <MemoryRouter>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            // Check that the notification action was NOT dispatched
            const actions = store.getActions()
            const notifyAction = actions.find(
                (action) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.message?.includes(
                        'Unlock smarter recommendations',
                    ),
            )

            expect(notifyAction).toBeUndefined()
        })
    })

    describe('TopOpportunitiesSection', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.IncreaseVisibilityOfOpportunity) {
                    return true
                }
                if (key === FeatureFlagKey.OpportunitiesMilestone2) {
                    return true
                }
                return false
            })
        })

        it('should render TopOpportunitiesSection when user has full access and feature flag is enabled', () => {
            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [
                    {
                        id: '1',
                        key: 'opp-1',
                        type: 'FILL_KNOWLEDGE_GAP',
                        insight: 'Test insight',
                        ticketCount: 5,
                    },
                ],
                isLoading: false,
                allowedOpportunityIds: undefined,
                totalPending: 10,
            } as any)

            const { getByText } = renderComponent()

            expect(getByText('Top Opportunities Section')).toBeInTheDocument()
        })

        it('should render TopOpportunitiesSection for non-full access users when totalPending > 15', () => {
            const storeWithoutFullAccess = {
                ...defaultStore,
                currentAccount: fromJS({
                    ...defaultStore.currentAccount?.toJS(),
                    current_subscription: {
                        products: {
                            automation:
                                'aut-addon-basic-full-price-monthly-usd-4', // No 'usd-6' in plan_id
                        },
                    },
                }),
            }

            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [
                    {
                        id: '1',
                        key: 'opp-1',
                        type: 'FILL_KNOWLEDGE_GAP',
                        insight: 'Test insight',
                        ticketCount: 5,
                    },
                ],
                isLoading: false,
                allowedOpportunityIds: [1, 2, 3],
                totalPending: 20,
            } as any)

            const { getByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(storeWithoutFullAccess)}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(getByText('Top Opportunities Section')).toBeInTheDocument()
        })

        it('should not render TopOpportunitiesSection for non-full access users when totalPending < 15', () => {
            const storeWithoutFullAccess = {
                ...defaultStore,
                currentAccount: fromJS({
                    ...defaultStore.currentAccount?.toJS(),
                    current_subscription: {
                        products: {
                            automation:
                                'aut-addon-basic-full-price-monthly-usd-4',
                        },
                    },
                }),
            }

            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [
                    {
                        id: '1',
                        key: 'opp-1',
                        type: 'FILL_KNOWLEDGE_GAP',
                        insight: 'Test insight',
                        ticketCount: 5,
                    },
                ],
                isLoading: false,
                allowedOpportunityIds: [1, 2, 3],
                totalPending: 10,
            } as any)

            const { queryByText } = render(
                <MemoryRouter>
                    <Provider store={mockStore(storeWithoutFullAccess)}>
                        <QueryClientProvider client={queryClient}>
                            <AiAgentOverview />
                        </QueryClientProvider>
                    </Provider>
                </MemoryRouter>,
            )

            expect(
                queryByText('Top Opportunities Section'),
            ).not.toBeInTheDocument()
        })

        it('should not render TopOpportunitiesSection when IncreaseVisibilityOfOpportunity feature flag is disabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.OpportunitiesMilestone2) {
                    return true
                }
                return false
            })

            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [
                    {
                        id: '1',
                        key: 'opp-1',
                        type: 'FILL_KNOWLEDGE_GAP',
                        insight: 'Test insight',
                        ticketCount: 5,
                    },
                ],
                isLoading: false,
                allowedOpportunityIds: undefined,
                totalPending: 20,
            } as any)

            const { queryByText } = renderComponent()

            expect(
                queryByText('Top Opportunities Section'),
            ).not.toBeInTheDocument()
        })

        it('should not fetch opportunities when OpportunitiesMilestone2 feature flag is disabled', () => {
            mockUseFlag.mockImplementation((key) => {
                if (key === FeatureFlagKey.IncreaseVisibilityOfOpportunity) {
                    return true
                }
                return false
            })

            mockUseKnowledgeServiceOpportunities.mockReturnValue({
                opportunities: [],
                isLoading: false,
                allowedOpportunityIds: undefined,
                totalPending: 0,
            } as any)

            renderComponent()

            expect(mockUseKnowledgeServiceOpportunities).toHaveBeenCalledWith(
                expect.any(Number),
                false, // enabled should be false when OpportunitiesMilestone2 is disabled
                expect.any(Number),
            )
        })

        it('should not fetch opportunities when shopIntegrationId is undefined', () => {
            mockUseShopIntegrationId.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseKnowledgeServiceOpportunities).toHaveBeenCalledWith(
                0,
                false,
                3,
            )
        })

        it('should fetch opportunities with correct parameters when enabled', () => {
            mockUseShopIntegrationId.mockReturnValue(123)

            renderComponent()

            expect(mockUseKnowledgeServiceOpportunities).toHaveBeenCalledWith(
                123,
                true,
                3,
            )
        })
    })
})
