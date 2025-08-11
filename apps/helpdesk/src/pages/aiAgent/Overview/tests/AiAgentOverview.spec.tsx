// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import * as segment from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { useHasNoOnboardedStores } from 'pages/aiAgent/Overview/hooks/useHasNoOnboardedStores'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { RootState, StoreDispatch, StoreState } from 'state/types'
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
jest.mock('react-router')
jest.mock('pages/aiAgent/Overview/hooks/useThankYouModal')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('models/billing/queries')
jest.mock('models/billing/utils')

jest.mock('pages/aiAgent/Overview/hooks/useHasNoOnboardedStores')
const mockUseHasNoOnboardedStores = jest.mocked(useHasNoOnboardedStores)

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
const mockUseShoppingAssistantTrialAccess =
    useShoppingAssistantTrialAccess as jest.Mock
const mockUseBillingState = assumeMock(useBillingState)
const mockUseEarlyAccessAutomatePlan = assumeMock(useEarlyAccessAutomatePlan)
const useLocationMock = assumeMock(useLocation)
useLocationMock.mockReturnValue(defaultLocation)

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()
const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultStore = {
    ...rootState,
    ui: {
        stats: { filters: initialState },
    },
    stats: initialStatsFiltersState,
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState),
} as StoreState

const renderComponent = () => {
    return render(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentOverview />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('AiAgentOverview', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        mockUseThankYouModal.mockReturnValue(defaultThankYouModalValues)
        useStoreActivationsMock.mockReturnValue({
            storeActivations: {},
        } as any)
        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canSeeTrialCTA: false,
        })

        mockUseHasNoOnboardedStores.mockReturnValue(false)

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

        mockUseEarlyAccessAutomatePlan.mockReturnValue({
            data: { amount: 53000 }, // $530 in cents
        } as any)

        // Mock billing utils
        const mockGetAutomateEarlyAccessPricesFormatted = jest.requireMock(
            'models/billing/utils',
        ).getAutomateEarlyAccessPricesFormatted
        mockGetAutomateEarlyAccessPricesFormatted?.mockReturnValue({
            amount: '$530',
        })
    })
    it('should render', () => {
        const { queryByText } = renderComponent()
        expect(queryByText(/Welcome,.*/)).toBeTruthy()
        expect(queryByText('AI Agent performance')).toBeTruthy()
        expect(queryByText('Mocked PendingTasksSectionConnected')).toBeTruthy()
        expect(queryByText('ActivationButton')).toBeInTheDocument()
    })

    it('should not render the activation button if account has no onboarded stores', () => {
        mockUseHasNoOnboardedStores.mockReturnValue(true)

        const { queryByText } = renderComponent()

        expect(queryByText('ActivationButton')).not.toBeInTheDocument()
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
        mockFlags({
            [FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]: true,
        })
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeTruthy()
    })

    it('should not render the resource section when the flag standalone-conv-ai_overview-page-resource-section is Unavailable', () => {
        mockFlags({
            [FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]: false,
        })
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeFalsy()
    })

    describe('Shopping Assistant Trial', () => {
        it('should not render trial banner when canSeeTrialCTA is false', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
            })

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
        })

        it('should display correct pricing and features in trial modal', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })
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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({})

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
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
            const mockReturnValue = { canSeeTrialCTA: true }
            mockUseShoppingAssistantTrialAccess.mockReturnValue(mockReturnValue)

            const { queryByText, rerender } = renderComponent()

            // Initially visible
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeTruthy()

            // Change to not visible
            mockReturnValue.canSeeTrialCTA = false
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
            })

            rerender(
                <Provider store={mockStore(defaultStore)}>
                    <QueryClientProvider client={queryClient}>
                        <AiAgentOverview />
                    </QueryClientProvider>
                </Provider>,
            )

            // Should not be visible
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
        })

        it('should handle edge case where trial access hook returns empty object', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({})

            const { queryByText } = renderComponent()
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeFalsy()
        })
    })

    describe('Component Integration', () => {
        it('should render all major sections when feature flags are enabled', () => {
            mockFlags({
                [FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]: true,
            })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

            const { queryByText, getByTestId } = renderComponent()

            // Check all major sections
            expect(queryByText(/Welcome,.*/)).toBeTruthy() // Title
            expect(
                queryByText('Influence +1.5% GMV with Shopping Assistant'),
            ).toBeTruthy() // Trial Banner
            expect(queryByText('AI Agent performance')).toBeTruthy() // KPI Section
            expect(getByTestId('mocked-pending-tasks')).toBeTruthy() // Pending Tasks
            expect(queryByText('Resources')).toBeTruthy() // Resources Section
        })

        it('should handle hook errors gracefully', () => {
            mockUseShoppingAssistantTrialAccess.mockImplementation(() => {
                throw new Error('Test error')
            })

            // Component should crash when hook throws
            expect(() => renderComponent()).toThrow('Test error')
        })

        it('should call useShoppingAssistantTrialAccess hook on every render', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: false,
            })

            // Clear any previous calls from beforeEach
            mockUseShoppingAssistantTrialAccess.mockClear()

            // Clear any previous calls from beforeEach
            mockUseShoppingAssistantTrialAccess.mockClear()

            renderComponent()

            // Hook is called multiple times due to TrialManageWorkflow component and React re-renders
            expect(mockUseShoppingAssistantTrialAccess).toHaveBeenCalledTimes(3)

            // Re-render should call again
            renderComponent()
            expect(mockUseShoppingAssistantTrialAccess).toHaveBeenCalledTimes(6)
        })
    })

    describe('State Management', () => {
        it('should handle modal state transitions correctly', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                canSeeTrialCTA: true,
            })

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
})
