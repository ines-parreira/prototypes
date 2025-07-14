import React from 'react'

import { fromJS } from 'immutable'

import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import CampaignRevenueChart from 'domains/reporting/pages/convert/components/CampaignRevenueChart/CampaignRevenueChart'
import useGetCampaignRevenueTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { campaign } from 'fixtures/campaign'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock(
    'domains/reporting/pages/convert/hooks/stats/useGetCampaignRevenueTimeSeries',
)
const useGetCampaignRevenueMock = assumeMock(useGetCampaignRevenueTimeSeries)

jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
    () => ({
        __esModule: true,
        default: () => {
            return <div>LineChart</div>
        },
    }),
)

describe('<CampaignRevenueChart />', () => {
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

        useGetCampaignRevenueMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [],
        })
    })

    it('renders without errors', () => {
        const { getByText } = renderWithStore(<CampaignRevenueChart />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetCampaignRevenueMock).toHaveBeenCalledTimes(1)
        expect(getByText('LineChart')).toBeInTheDocument()
    })

    it('renders when no data', () => {
        useGetCampaignRevenueMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        const { getByText } = renderWithStore(<CampaignRevenueChart />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetCampaignRevenueMock).toHaveBeenCalledTimes(1)
        expect(getByText('LineChart')).toBeInTheDocument()
    })
})
