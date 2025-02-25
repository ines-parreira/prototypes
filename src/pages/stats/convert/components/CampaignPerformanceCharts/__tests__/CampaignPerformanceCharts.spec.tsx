import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'

import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import CampaignPerformanceCharts from 'pages/stats/convert/components/CampaignPerformanceCharts/CampaignPerformanceCharts'
import useCampaignPerformanceTimeSeries from 'pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries')
const useCampaignPerformanceTimeSeriesMock = assumeMock(
    useCampaignPerformanceTimeSeries,
)

jest.mock('pages/stats/common/components/charts/LineChart/LineChart', () => ({
    __esModule: true,
    default: () => {
        return <div>LineChart</div>
    },
}))

const queryClient = mockQueryClient()

describe('CampaignPerformanceCharts', () => {
    beforeAll(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
        })
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
            selectedIntegrations: [shopifyIntegration.id],
            selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
            selectedCampaignIds: [],
            campaigns: [campaign],
        } as any)

        useCampaignPerformanceTimeSeriesMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
    })

    it('renders', () => {
        const { getAllByText } = renderWithStore(
            <QueryClientProvider client={queryClient}>
                <CampaignPerformanceCharts />
            </QueryClientProvider>,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            },
        )

        expect(useCampaignPerformanceTimeSeriesMock).toHaveBeenCalledTimes(2)
        expect(getAllByText('LineChart')).toHaveLength(3)
    })
})
