import React from 'react'

import {fromJS} from 'immutable'
import routerDom, {useParams} from 'react-router-dom'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {campaign} from 'fixtures/campaign'
import {assumeMock, renderWithStore} from 'utils/testing'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {useGetTableStat} from 'pages/stats/convert/hooks/stats/useGetTableStat'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/stats/useGetTableStat')
const useGetTableStatMock = assumeMock(useGetTableStat)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

describe('CampaignPerformanceTable', () => {
    beforeEach(() => {
        useCampaignStatsFiltersMock.mockReturnValue({
            selectedPeriod: {
                start_datetime: '2020-01-01T00:00:00.000Z',
                end_datetime: '2020-01-31T23:59:59.999Z',
            },
            selectedIntegrations: [shopifyIntegration.id],
            selectedCampaignIds: [],
            campaigns: [campaign],
        } as any)

        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })

        useGetTableStatMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {},
        })
    })

    it('should render and call stats', () => {
        renderWithStore(<CampaignPerformanceTable />, {
            integrations: fromJS({
                integrations: [
                    ...integrationsState.integrations,
                    shopifyIntegration,
                ],
            }),
        })

        expect(useGetTableStatMock).toHaveBeenCalledTimes(2)
    })
})
