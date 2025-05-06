import React from 'react'

import { screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { RootState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import AiSalesAgentSalesOverview from '../AiSalesAgentSalesOverview'

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const mockUseCanUseAiSalesAgent = jest.mocked(useCanUseAiSalesAgent)

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(() => ({
        earlyAccessModal: null,
        showEarlyAccessModal: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/AiAgentPaywallView', () => ({
    AiAgentPaywallView: () => <div>ai-agent-paywall</div>,
}))

const mockUseFirstStoreWithAiSalesDataState: {
    isLoading: boolean
    storeId: number | undefined
} = {
    isLoading: false,
    storeId: 123,
}

jest.mock('pages/stats/convert/hooks/useFirstStoreWithAiSalesData', () => ({
    useFirstStoreWithAiSalesData: () => ({
        isLoading: mockUseFirstStoreWithAiSalesDataState.isLoading,
        storeId: mockUseFirstStoreWithAiSalesDataState.storeId,
    }),
}))

jest.mock('pages/stats/convert/providers/CampaignStatsFilters', () => ({
    CampaignStatsFilters: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/stats/common/filters/FiltersPanelWrapper', () => () => (
    <div>filters-panel</div>
))

jest.mock('pages/stats/common/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

jest.mock('pages/stats/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

jest.mock(
    'pages/stats/automate/aiSalesAgent/charts/GmvInfluencedOverTimeChart',
    () => () => <div>gmv-influenced-over-time-chart</div>,
)

jest.mock(
    'pages/stats/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton',
    () => () => <div>download-button</div>,
)

jest.mock(
    'pages/stats/automate/aiSalesAgent/charts/AiSalesAgentTrendCard',
    () => () => <div>generic-trend-card</div>,
)

jest.mock('pages/stats/dashboards/DashboardComponent', () => ({
    DashboardComponent: () => <div>top-products-table</div>,
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ shopName: 'test-shop' }),
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
    } as RootState

    const renderComponent = () => {
        return renderWithStoreAndQueryClientProvider(
            <AiSalesAgentSalesOverview />,
            state,
        )
    }

    beforeEach(() => {
        mockUseFirstStoreWithAiSalesDataState.isLoading = false
        mockUseFirstStoreWithAiSalesDataState.storeId = 123
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.StandaloneAiSalesDiscountSection]: false,
        })
        mockUseCanUseAiSalesAgent.mockReturnValue(true)
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
            [FeatureFlagKey.StandaloneAiSalesDiscountSection]: true,
        })

        renderComponent()
        expect(await screen.findByText('Discounts')).toBeInTheDocument()
    })

    it('should not render discount section when feature flag is disabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.StandaloneAiSalesDiscountSection]: false,
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

    it('should render all chart components', () => {
        renderComponent()
        expect(
            screen.getAllByText('generic-trend-card').length,
        ).toBeGreaterThan(0)
        expect(
            screen.getByText('gmv-influenced-over-time-chart'),
        ).toBeInTheDocument()
        expect(screen.getByText('top-products-table')).toBeInTheDocument()
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
})
