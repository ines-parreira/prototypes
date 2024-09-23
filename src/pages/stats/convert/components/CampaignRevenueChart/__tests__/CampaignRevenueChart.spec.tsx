import React from 'react'
import {fromJS} from 'immutable'

import {campaign} from 'fixtures/campaign'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'

import {assumeMock, renderWithStore} from 'utils/testing'

import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import useGetCampaignRevenue from 'pages/stats/convert/hooks/stats/useGetCampaignRevenue'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'

import CampaignRevenueChart from '../CampaignRevenueChart'

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/stats/useGetCampaignRevenue')
const useGetCampaignRevenueMock = assumeMock(useGetCampaignRevenue)

jest.mock('pages/stats/common/components/charts/LineChart/LineChart', () => ({
    __esModule: true,
    default: () => {
        return <div>LineChart</div>
    },
}))

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
        const {getByText} = renderWithStore(<CampaignRevenueChart />, {
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
