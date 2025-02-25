import React from 'react'

import { fromJS } from 'immutable'

import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { CampaignRevenueShareStat } from 'pages/stats/convert/components/CampaignRevenueShareStat/CampaignRevenueShareStat'
import { useGetRevenueShareChart } from 'pages/stats/convert/hooks/stats/useGetRevenueShareChart'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/stats/useGetRevenueShareChart')
const useGetRevenueShareChartMock = assumeMock(useGetRevenueShareChart)

jest.mock('pages/stats/common/components/charts/LineChart/LineChart', () => ({
    __esModule: true,
    default: () => {
        return <div>LineChart</div>
    },
}))

describe('<CampaignRevenueShareStat />', () => {
    beforeAll(() => {
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

        useGetRevenueShareChartMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [],
        })
    })

    it('renders without errors', () => {
        const { getByText } = renderWithStore(<CampaignRevenueShareStat />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetRevenueShareChartMock).toHaveBeenCalledTimes(1)
        expect(getByText('LineChart')).toBeInTheDocument()
    })

    it('renders when no data', () => {
        useGetRevenueShareChartMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        const { getByText } = renderWithStore(<CampaignRevenueShareStat />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetRevenueShareChartMock).toHaveBeenCalledTimes(1)
        expect(getByText('LineChart')).toBeInTheDocument()
    })
})
