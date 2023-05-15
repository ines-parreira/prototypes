import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {UseQueryResult} from '@tanstack/react-query'

import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {RootState, StoreDispatch} from 'state/types'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useResolutionTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {assumeMock} from 'utils/testing'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import useTimeSeries from 'hooks/reporting/useTimeSeries'
import {useGetReporting} from 'models/reporting/queries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'

import SupportPerformanceOverview from '../SupportPerformanceOverview'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('react-chartjs-2')
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)

jest.mock('hooks/reporting/metricTrends')
const useCustomerSatisfactionTrendMock = assumeMock(
    useCustomerSatisfactionTrend
)
const useFirstResponseTimeTrendMock = assumeMock(useFirstResponseTimeTrend)
const useResolutionTimeTrendMock = assumeMock(useResolutionTimeTrend)
const useMessagesPerTicketTrendMock = assumeMock(useMessagesPerTicketTrend)
const useOpenTicketsTrendMock = assumeMock(useOpenTicketsTrend)
const useClosedTicketsTrendMock = assumeMock(useClosedTicketsTrend)
const useTicketsCreatedTrendMock = assumeMock(useTicketsCreatedTrend)
const useTicketsRepliedTrendMock = assumeMock(useTicketsRepliedTrend)
const useMessagesSentTrendMock = assumeMock(useMessagesSentTrend)

jest.mock('hooks/reporting/timeSeries')
const useTicketsCreatedTimeSeriesMock = assumeMock(useTicketsCreatedTimeSeries)
const useTicketsClosedTimeSeriesMock = assumeMock(useTicketsClosedTimeSeries)
const useTicketsRepliedTimeSeriesMock = assumeMock(useTicketsRepliedTimeSeries)
const useMessagesSentTimeSeriesMock = assumeMock(useMessagesSentTimeSeries)

jest.mock('models/reporting/queries')
const useGetReportingMock = assumeMock(useGetReporting)

jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

describe('<SupportPerformanceOverview />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
    } as RootState

    const defaultMetricTrend: MetricTrend = {
        isFetching: false,
        isError: true,
        data: {
            value: 456,
            prevValue: 123,
        },
    }

    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    beforeEach(() => {
        jest.resetAllMocks()
        useCustomerSatisfactionTrendMock.mockReturnValue(defaultMetricTrend)
        useFirstResponseTimeTrendMock.mockReturnValue(defaultMetricTrend)
        useResolutionTimeTrendMock.mockReturnValue(defaultMetricTrend)
        useMessagesPerTicketTrendMock.mockReturnValue(defaultMetricTrend)
        useOpenTicketsTrendMock.mockReturnValue(defaultMetricTrend)
        useClosedTicketsTrendMock.mockReturnValue(defaultMetricTrend)
        useTicketsCreatedTrendMock.mockReturnValue(defaultMetricTrend)
        useTicketsRepliedTrendMock.mockReturnValue(defaultMetricTrend)
        useMessagesSentTrendMock.mockReturnValue(defaultMetricTrend)
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useGetReportingMock.mockReturnValue({
            data: [
                {
                    value: 200,
                    label: TicketChannel.Email,
                },
                {
                    value: 34,
                    label: TicketChannel.Chat,
                },
            ],
        } as UseQueryResult)
        useCleanStatsFiltersMock.mockReturnValue(defaultStatsFilters)
    })

    it('should render the page', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
