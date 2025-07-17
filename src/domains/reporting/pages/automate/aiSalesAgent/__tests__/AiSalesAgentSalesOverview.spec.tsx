import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import AiSalesAgentSalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

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

jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
const mockUseShoppingAssistantTrialAccess = jest.mocked(
    useShoppingAssistantTrialAccess,
)

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

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const mockUseStoreActivations = assumeMock(useStoreActivations)

jest.mock('models/billing/queries', () => ({
    useEarlyAccessAutomatePlan: jest.fn(),
}))

const mockUseEarlyAccessAutomatePlan = jest.mocked(useEarlyAccessAutomatePlan)

const mockUseFlags = useFlags as jest.Mock

describe('AiSalesAgentSalesOverview', () => {
    const state = {
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
        currentAccount: fromJS({ domain: 'test-account' }),
    } as RootState

    const renderComponent = () => {
        return renderWithStoreAndQueryClientAndRouter(
            <AiSalesAgentSalesOverview />,
            state,
        )
    }

    const mockStartTrial = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFirstStoreWithAiSalesDataState.isLoading = false
        mockUseFirstStoreWithAiSalesDataState.storeId = 123
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
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

        // Mock useShoppingAssistantTrialAccess
        mockUseShoppingAssistantTrialAccess.mockReturnValue({
            canNotifyAdmin: false,
            canBookDemo: false,
            canSeeSystemBanner: false,
            canSeeTrialCTA: false, // Default to false, will override in specific tests
            hasCurrentStoreTrialStarted: false,
            hasAnyTrialStarted: false,
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialExpired: false,
            hasAnyTrialOptedIn: false,
            hasAnyTrialActive: false,
        })

        // Mock useFlag
        mockUseFlag.mockReturnValue(false)

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
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        })

        renderComponent()
        expect(await screen.findByText('Discounts')).toBeInTheDocument()
    })

    it('should not render discount section when feature flag is disabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
        })

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
                screen.getByText('Start 14-Day Trial At No Additional Cost'),
            ).toBeInTheDocument()
        })
    })
})
