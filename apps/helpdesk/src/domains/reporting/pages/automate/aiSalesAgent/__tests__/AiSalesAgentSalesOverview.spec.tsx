import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import AiSalesAgentSalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { products } from 'fixtures/productPrices'
import { user } from 'fixtures/users'
import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { ProductType } from 'models/billing/types'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const mockUseCanUseAiSalesAgent = jest.mocked(useCanUseAiSalesAgent)
const mockUseAtLeastOneStoreHasActiveTrial = jest.mocked(
    useAtLeastOneStoreHasActiveTrial,
)

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(() => ({
        earlyAccessModal: null,
        showEarlyAccessModal: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/AiAgentPaywallView', () => ({
    AiAgentPaywallView: ({ children }: { children: React.ReactNode }) => (
        <div>
            ai-agent-paywall
            {children}
        </div>
    ),
}))

jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')
const mockUseActivateAiAgentTrial = jest.mocked(useActivateAiAgentTrial)

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const mockUseTrialAccess = jest.mocked(useTrialAccess)

jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
const mockUseSalesTrialRevampMilestone = jest.mocked(
    useSalesTrialRevampMilestone,
)

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock(
    'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal',
    () => ({
        UpgradePlanModal: ({
            title,
            onClose,
            onConfirm,
        }: {
            title: string
            onClose: () => void
            onConfirm: () => void
        }) => (
            <div data-testid="upgrade-plan-modal">
                <h1>{title}</h1>
                <button onClick={onClose}>Close Modal</button>
                <button onClick={onConfirm}>Confirm Modal</button>
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal',
    () =>
        ({
            isOpen,
            onClick,
            onClose,
        }: {
            isOpen: boolean
            onClick: () => void
            onClose: () => void
        }) =>
            isOpen ? (
                <div data-testid="trial-success-modal">
                    <button onClick={onClick}>Go to Customer Engagement</button>
                    <button onClick={onClose}>Close Success Modal</button>
                </div>
            ) : null,
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ shopName: 'test-shop' }),
    useHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}))

const mockUseFirstStoreWithAiSalesDataState: {
    isLoading: boolean
    storeId: number | undefined
} = {
    isLoading: false,
    storeId: 123,
}

jest.mock(
    'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData',
    () => ({
        useFirstStoreWithAiSalesData: () => ({
            isLoading: mockUseFirstStoreWithAiSalesDataState.isLoading,
            storeId: mockUseFirstStoreWithAiSalesDataState.storeId,
        }),
    }),
)

jest.mock(
    'domains/reporting/pages/convert/providers/CampaignStatsFilters',
    () => ({
        CampaignStatsFilters: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    }),
)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => () => <div>filters-panel</div>,
)

jest.mock('domains/reporting/pages/common/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/charts/GmvInfluencedOverTimeChart',
    () => () => <div>gmv-influenced-over-time-chart</div>,
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton',
    () => () => <div>download-button</div>,
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/charts/AiSalesAgentTrendCard',
    () => () => <div>generic-trend-card</div>,
)

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: () => <div>top-products-table</div>,
}))

jest.mock(
    'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName',
    () => ({
        useStoreIntegrationByShopName: () => ({
            id: 123,
            name: 'test-shop',
        }),
    }),
)

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const mockUseStoreActivations = assumeMock(useStoreActivations)

jest.mock('models/billing/queries', () => ({
    useEarlyAccessAutomatePlan: jest.fn(),
}))

const mockUseEarlyAccessAutomatePlan = jest.mocked(useEarlyAccessAutomatePlan)

describe('AiSalesAgentSalesOverview', () => {
    const baseState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: {
                filters: initialState,
            },
        },
        billing: fromJS(billingState),
        integrations: fromJS(integrationsState),
        currentUser: fromJS(user),
        currentAccount: fromJS({
            domain: 'test-account',
            current_subscription: {
                products: {},
            },
        }),
    } as RootState

    const renderComponent = (customState = baseState) => {
        return renderWithStoreAndQueryClientAndRouter(
            <AiSalesAgentSalesOverview />,
            customState,
        )
    }

    const mockStartTrial = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFirstStoreWithAiSalesDataState.isLoading = false
        mockUseFirstStoreWithAiSalesDataState.storeId = 123
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return false
            return false
        })
        mockUseCanUseAiSalesAgent.mockReturnValue(true)
        mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                'test-shop': {
                    configuration: {
                        monitoredChatIntegrations: [2],
                    },
                    support: {
                        chat: {
                            isIntegrationMissing: false,
                        },
                    },
                    sales: {
                        enabled: true,
                    },
                },
            },
            isFetchLoading: false,
        } as unknown as ReturnType<typeof useStoreActivations>)

        // Mock useActivateAiAgentTrial
        mockUseActivateAiAgentTrial.mockReturnValue({
            routes: { customerEngagement: '/customer-engagement' },
            startTrial: mockStartTrial,
            canStartTrial: false,
            canStartTrialFromFeatureFlag: false,
            isLoading: false,
        } as any)

        // Mock mockUseTrialAccess
        mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

        // Mock useSalesTrialRevampMilestone
        mockUseSalesTrialRevampMilestone.mockReturnValue('off')

        // Mock useEarlyAccessAutomatePlan - default to null (no plan)
        mockUseEarlyAccessAutomatePlan.mockReturnValue({ data: null } as any)
    })

    it('should render when store data is ready', () => {
        renderComponent()
        expect(screen.getByText('Shopping Assistant')).toBeInTheDocument()
        expect(screen.getByText('download-button')).toBeInTheDocument()
        expect(screen.getByText('filters-panel')).toBeInTheDocument()
        expect(screen.getByText('analytics-footer')).toBeInTheDocument()
    })

    it('should render loading state while data is loading', () => {
        mockUseFirstStoreWithAiSalesDataState.isLoading = true
        mockUseFirstStoreWithAiSalesDataState.storeId = undefined

        const { container } = renderComponent()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render discount section when feature flag is enabled', async () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return true
            return false
        })

        renderComponent()
        expect(await screen.findByText('Discounts')).toBeInTheDocument()
    })

    it('should not render discount section when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        renderComponent()
        expect(screen.queryByText('Discounts')).not.toBeInTheDocument()
    })

    it('should render all main metric sections', () => {
        renderComponent()

        expect(screen.getByText('Main metrics')).toBeInTheDocument()
        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant performance'),
        ).toBeInTheDocument()
        expect(screen.getByText('Product recommendations')).toBeInTheDocument()
    })

    it('should render all chart components', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getAllByText('generic-trend-card').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getByText('gmv-influenced-over-time-chart'),
            ).toBeInTheDocument()
            expect(screen.getByText('top-products-table')).toBeInTheDocument()
        })
    })

    it('should render paywall when user does not have access to Ai Sales Agent', () => {
        mockUseCanUseAiSalesAgent.mockReturnValue(false)

        renderComponent()

        expect(screen.getByText('ai-agent-paywall')).toBeInTheDocument()
    })

    it('should not render paywall when user has access to Ai Sales Agent', () => {
        mockUseCanUseAiSalesAgent.mockReturnValue(true)

        renderComponent()

        expect(screen.queryByText('ai-agent-paywall')).not.toBeInTheDocument()
    })

    describe('Upgrade Now button visibility', () => {
        beforeEach(() => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseActivateAiAgentTrial.mockReturnValue({
                routes: { customerEngagement: '/customer-engagement' },
                startTrial: mockStartTrial,
                canStartTrial: true,
                canStartTrialFromFeatureFlag: false,
                isLoading: false,
            } as any)
        })

        it('should not render Upgrade Now button when earlyAccessPlan is null', () => {
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: null,
            } as any)

            renderComponent()

            expect(screen.queryByText('Upgrade Now')).not.toBeInTheDocument()
        })

        it('should render Upgrade Now button when earlyAccessPlan is present', () => {
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: {
                    id: 'plan-123',
                    name: 'Early Access Plan',
                },
            } as any)

            renderComponent()

            expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
        })

        it('should render Start trial button regardless of earlyAccessPlan when canStartTrial is true', () => {
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: { id: 'plan-123' },
            } as any)

            renderComponent()

            expect(
                screen.getByText(
                    `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Paywall display logic with milestone-1 and isAiSalesAlphaDemoUser', () => {
        beforeEach(() => {
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
        })

        it('should not show paywall when isAiSalesAlphaDemoUser is true regardless of other conditions', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiSalesAgentBypassPlanCheck)
                    return true
                return false
            })

            renderComponent()

            expect(
                screen.queryByText('ai-agent-paywall'),
            ).not.toBeInTheDocument()
        })

        it('should show paywall when isAiSalesAlphaDemoUser is false and other conditions are not met', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(screen.getByText('ai-agent-paywall')).toBeInTheDocument()
        })

        it('should not show paywall when user has new automate plan (generation >= 6) even without trial', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)

            // Create state with a new automate plan
            // We need to update the products fixture to include a plan with generation 6
            const productsWithNewAutomatePlan = products.map((product) => {
                if (product.type === ProductType.Automation) {
                    return {
                        ...product,
                        prices: product.prices.map((plan, index) =>
                            index === 0 ? { ...plan, generation: 6 } : plan,
                        ),
                    }
                }
                return product
            })

            const stateWithNewAutomatePlan = {
                ...baseState,
                billing: fromJS({
                    ...billingState,
                    products: productsWithNewAutomatePlan,
                }),
                currentAccount: fromJS({
                    domain: 'test-account',
                    current_subscription: {
                        products: {
                            // Use the price_id from the first automation plan in our fixture
                            prod_automation: 'price_1LJBjXI9qXomtXqSSX34F3we',
                        },
                    },
                }),
            } as RootState

            renderComponent(stateWithNewAutomatePlan)

            expect(
                screen.queryByText('ai-agent-paywall'),
            ).not.toBeInTheDocument()
        })

        it('should show paywall when user has old automate plan (generation < 6) and no trial', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)

            // Create state with an old automate plan
            const productsWithOldAutomatePlan = products.map((product) => {
                if (product.type === ProductType.Automation) {
                    return {
                        ...product,
                        prices: product.prices.map((plan, index) =>
                            index === 0 ? { ...plan, generation: 5 } : plan,
                        ),
                    }
                }
                return product
            })

            const stateWithOldAutomatePlan = {
                ...baseState,
                billing: fromJS({
                    ...billingState,
                    products: productsWithOldAutomatePlan,
                }),
                currentAccount: fromJS({
                    domain: 'test-account',
                    current_subscription: {
                        products: {
                            // Use the price_id from the first automation plan in our fixture
                            prod_automation: 'price_1LJBjXI9qXomtXqSSX34F3we',
                        },
                    },
                }),
            } as RootState

            renderComponent(stateWithOldAutomatePlan)

            expect(screen.getByText('ai-agent-paywall')).toBeInTheDocument()
        })

        it('should show paywall when user has no automate plan and no trial', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)

            renderComponent()

            expect(screen.getByText('ai-agent-paywall')).toBeInTheDocument()
        })

        it('should not show paywall when user has active trial regardless of automate plan', () => {
            mockUseCanUseAiSalesAgent.mockReturnValue(false)
            mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasCurrentStoreTrialStarted: true,
                    hasAnyTrialStarted: true,
                    hasAnyTrialOptedIn: true,
                    hasAnyTrialActive: true,
                }),
            )

            renderComponent()

            expect(
                screen.queryByText('ai-agent-paywall'),
            ).not.toBeInTheDocument()
        })
    })
})
