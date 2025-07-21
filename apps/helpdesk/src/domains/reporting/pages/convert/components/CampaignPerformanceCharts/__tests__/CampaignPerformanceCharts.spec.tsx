import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import CampaignPerformanceCharts from 'domains/reporting/pages/convert/components/CampaignPerformanceCharts/CampaignPerformanceCharts'
import useCampaignPerformanceTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('domains/reporting/pages/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock(
    'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries',
)
const useCampaignPerformanceTimeSeriesMock = assumeMock(
    useCampaignPerformanceTimeSeries,
)

jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
    () => ({
        __esModule: true,
        default: () => {
            return <div>LineChart</div>
        },
    }),
)

const queryClient = mockQueryClient()

describe('CampaignPerformanceCharts', () => {
    beforeAll(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isRouteRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
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
