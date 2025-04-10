import React from 'react'

import { screen } from '@testing-library/react'

import { RootState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { renderWithStore } from 'utils/testing'

import AiSalesAgentSalesOverview from '../AiSalesAgentSalesOverview'

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
        return renderWithStore(<AiSalesAgentSalesOverview />, state)
    }

    beforeEach(() => {
        mockUseFirstStoreWithAiSalesDataState.isLoading = false
        mockUseFirstStoreWithAiSalesDataState.storeId = 123
    })

    it('should render when store data is ready', () => {
        renderComponent()
        expect(screen.getByText('AI Agent Sales')).toBeInTheDocument()
        expect(screen.getByText('download-button')).toBeInTheDocument()
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
})
