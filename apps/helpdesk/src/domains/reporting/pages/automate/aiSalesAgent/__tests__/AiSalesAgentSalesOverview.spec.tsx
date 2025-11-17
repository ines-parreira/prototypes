import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import AiSalesAgentSalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ shopName: 'test-shop' }),
}))

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

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFirstStoreWithAiSalesDataState.isLoading = false
        mockUseFirstStoreWithAiSalesDataState.storeId = 123
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantEnabled) return false
            return false
        })
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
        expect(
            await screen.findByText(
                'Discounts generated by Shopping Assistant',
            ),
        ).toBeInTheDocument()
    })

    it('should not render discount section when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        renderComponent()
        expect(
            screen.queryByText('Discounts generated by Shopping Assistant'),
        ).not.toBeInTheDocument()
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
})
