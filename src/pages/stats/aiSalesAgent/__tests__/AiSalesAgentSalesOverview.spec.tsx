import React from 'react'

import { screen } from '@testing-library/react'

import { RootState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { renderWithStore } from 'utils/testing'

import AiSalesAgentSalesOverview from '../AiSalesAgentSalesOverview'

jest.mock('pages/stats/convert/providers/CampaignStatsFilters', () => ({
    CampaignStatsFilters: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

jest.mock('pages/stats/common/filters/FiltersPanelWrapper', () => () => (
    <div>filters-panel</div>
))

jest.mock('pages/stats/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>analytics-footer</div>,
}))

jest.mock('pages/stats/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

// Mock charts
jest.mock(
    'pages/stats/aiSalesAgent/charts/GmvInfluencedOverTimeChart',
    () => () => <div>gmv-influenced-over-time-chart</div>,
)

jest.mock(
    'pages/stats/aiSalesAgent/AiSalesAgentOverviewDownloadButton',
    () => () => <div>download-button</div>,
)

jest.mock('pages/stats/aiSalesAgent/charts/AiSalesAgentTrendCard', () => () => (
    <div>generic-trend-card</div>
))

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
        renderWithStore(<AiSalesAgentSalesOverview />, state)
    }

    it('should render', () => {
        renderComponent()

        expect(screen.getByText('AI Agent Sales')).toBeInTheDocument()
        expect(screen.getByText('download-button')).toBeInTheDocument()
    })
})
