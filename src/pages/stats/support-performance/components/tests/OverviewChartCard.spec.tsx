import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {StatsFilters} from 'models/stat/types'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import useTimeSeries from 'hooks/reporting/useTimeSeries'
import {OverviewChartCard} from 'pages/stats/support-performance/components/OverviewChartCard'
import {OverviewChartConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {CHART_TOOLTIP_TARGET as lineChartTooltipTarget} from 'pages/stats/common/components/charts/LineChart/LineChart'
import {CHART_TOOLTIP_TARGET as barChartTooltipTarget} from 'pages/stats/common/components/charts/BarChart/BarChart'

jest.mock('hooks/reporting/timeSeries')
const useTicketsCreatedTimeSeriesMock = assumeMock(useTicketsCreatedTimeSeries)
const useTicketsClosedTimeSeriesMock = assumeMock(useTicketsClosedTimeSeries)
const useTicketsRepliedTimeSeriesMock = assumeMock(useTicketsRepliedTimeSeries)
const useMessagesSentTimeSeriesMock = assumeMock(useMessagesSentTimeSeries)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<OverviewChartCard />', () => {
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
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
    })

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

    it.each(Object.values(OverviewChartConfig))(
        'should fetch TimeSeries data and render with line chart',
        (config) => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard {...config} chartType="line" />
                </Provider>
            )
            expect(container.querySelector('canvas')?.id).toContain(
                lineChartTooltipTarget
            )
        }
    )

    it.each(Object.values(OverviewChartConfig))(
        'should fetch TimeSeries data and render with bar chart',
        (config) => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard {...config} chartType="bar" />
                </Provider>
            )
            expect(container.querySelector('canvas')?.id).toContain(
                barChartTooltipTarget
            )
        }
    )
})
