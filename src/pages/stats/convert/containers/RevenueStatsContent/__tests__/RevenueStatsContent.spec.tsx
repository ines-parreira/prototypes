import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'

import React from 'react'
import routerDom, {useParams} from 'react-router-dom'

import {campaign} from 'fixtures/campaign'
import {integrationsState, shopifyIntegration} from 'fixtures/integrations'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import * as useIsConvertPerformanceViewEnabled from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

import useCampaignPerformanceTimeSeries from 'pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import useGetCampaignRevenueTimeSeries from 'pages/stats/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import {useGetTotalsStat} from 'pages/stats/convert/hooks/stats/useGetTotalsStat'

import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithStore} from 'utils/testing'

import {RevenueStatsContent} from '../RevenueStatsContent'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('pages/stats/convert/hooks/useCampaignStatsFilters')
const useCampaignStatsFiltersMock = assumeMock(useCampaignStatsFilters)

jest.mock('pages/stats/convert/hooks/stats/useGetCampaignRevenueTimeSeries')
const useGetCampaignRevenueMock = assumeMock(useGetCampaignRevenueTimeSeries)

jest.mock('pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries')
const useCampaignPerformanceTimeSeriesMock = assumeMock(
    useCampaignPerformanceTimeSeries
)

jest.mock('pages/stats/convert/hooks/stats/useGetTotalsStat')
const useGetTotalsStatMock = assumeMock(useGetTotalsStat)

jest.mock('pages/stats/common/components/charts/LineChart/LineChart', () => ({
    __esModule: true,
    default: () => {
        return <div>LineChart</div>
    },
}))

jest.mock('pages/stats/convert/containers/CampaignPerformanceTable', () => ({
    CampaignPerformanceTable: () => {
        return <div>Campaign Performance Table</div>
    },
}))

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

const queryClient = mockQueryClient()

describe('<RevenueStatsContent />', () => {
    const renderComponent = () => {
        return renderWithStore(
            <QueryClientProvider client={queryClient}>
                <RevenueStatsContent />
            </QueryClientProvider>,
            {
                integrations: fromJS({
                    integrations: [
                        ...integrationsState.integrations,
                        shopifyIntegration,
                    ],
                }),
            }
        )
    }

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

        useGetCampaignRevenueMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: [],
        })

        useGetTotalsStatMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                impressions: '0',
                engagement: '0',
                campaignSalesCount: '0',
                gmv: '0',
                influencedRevenueShare: '0',
                revenue: '0',
            },
        })

        useParamsMock.mockReturnValue({
            [CONVERT_ROUTE_PARAM_NAME]: '118',
        })
    })

    it('renders with feature flag disabled', () => {
        jest.spyOn(
            useIsConvertPerformanceViewEnabled,
            'useIsConvertPerformanceViewEnabled'
        ).mockImplementation(() => false)

        const {getByText, queryByText} = renderComponent()

        expect(getByText('Campaign Performance Table')).toBeInTheDocument()
        expect(queryByText('Revenue Performance')).not.toBeInTheDocument()
        expect(queryByText('Campaign Performance')).not.toBeInTheDocument()
    })

    it('renders with feature flag enabled', () => {
        jest.spyOn(
            useIsConvertPerformanceViewEnabled,
            'useIsConvertPerformanceViewEnabled'
        ).mockImplementation(() => true)

        const {getByText} = renderComponent()

        expect(getByText('Campaign Performance Table')).toBeInTheDocument()
        expect(getByText('Revenue Performance')).toBeInTheDocument()
        expect(getByText('Campaign Performance')).toBeInTheDocument()
    })
})
