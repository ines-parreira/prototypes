import React from 'react'

import { render, screen } from '@testing-library/react'

import AiSalesAgentSalesOverview from '../AiSalesAgentSalesOverview'

jest.mock(
    'hooks/useAppSelector',
    () =>
        (fn: () => any): any =>
            fn(),
)

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

jest.mock('pages/stats/custom-reports/CustomReportComponent', () => ({
    CustomReportComponent: () => <div>top-products-table</div>,
}))

describe('AiSalesAgentSalesOverview', () => {
    const renderComponent = () => {
        render(<AiSalesAgentSalesOverview />)
    }
    it('should render', () => {
        renderComponent()

        expect(screen.getByText('AI Agent Sales Overview')).toBeInTheDocument()
        expect(screen.getByText('download-button')).toBeInTheDocument()
    })
})
