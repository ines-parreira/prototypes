import { assumeMock, render } from '@repo/testing'
import { fromJS } from 'immutable'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import CampaignPerformanceCharts from 'domains/reporting/pages/convert/components/CampaignPerformanceCharts/CampaignPerformanceCharts'
import useCampaignPerformanceTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'

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
        const { getAllByText } = render(<CampaignPerformanceCharts />, {
            storeState: {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            },
        })

        expect(useCampaignPerformanceTimeSeriesMock).toHaveBeenCalledTimes(2)
        expect(getAllByText('LineChart')).toHaveLength(3)
    })
})
