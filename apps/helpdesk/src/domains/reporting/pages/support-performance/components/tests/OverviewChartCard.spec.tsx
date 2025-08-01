import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useMessagesSentTimeSeries,
    useOneTouchTicketsTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
    useZeroTouchTicketsTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { CHART_TOOLTIP_TARGET as barChartTooltipTarget } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { CHART_TOOLTIP_TARGET as lineChartTooltipTarget } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { OverviewChartCard } from 'domains/reporting/pages/support-performance/components/OverviewChartCard'
import { OverviewChartConfig } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/timeSeries')
const useTicketsCreatedTimeSeriesMock = assumeMock(useTicketsCreatedTimeSeries)
const useTicketsClosedTimeSeriesMock = assumeMock(useTicketsClosedTimeSeries)
const useTicketsRepliedTimeSeriesMock = assumeMock(useTicketsRepliedTimeSeries)
const useMessagesSentTimeSeriesMock = assumeMock(useMessagesSentTimeSeries)
const useOneTouchTicketsTimeSeriesMock = assumeMock(
    useOneTouchTicketsTimeSeries,
)
const useZeroTouchTicketsTimeSeriesMock = assumeMock(
    useZeroTouchTicketsTimeSeries,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<OverviewChartCard />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState
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
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useOneTouchTicketsTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useZeroTouchTicketsTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
    })

    it.each(Object.values(OverviewChartConfig))(
        'should fetch TimeSeries data and render with line chart',
        (config) => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard {...config} chartType="line" />
                </Provider>,
            )
            expect(container.querySelector('canvas')?.id).toContain(
                lineChartTooltipTarget,
            )
        },
    )

    it.each(Object.values(OverviewChartConfig))(
        'should fetch TimeSeries data and render with bar chart',
        (config) => {
            const { container } = render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard {...config} chartType="bar" />
                </Provider>,
            )
            expect(container.querySelector('canvas')?.id).toContain(
                barChartTooltipTarget,
            )
        },
    )

    describe('statsFilters', () => {
        const config = {
            title: 'some title',
            hint: { title: 'Some description of the metric' },
            chartType: 'bar' as const,
        }
        const userTimezone = DEFAULT_TIMEZONE
        const granularity = ReportingGranularity.Day

        it('should pas legacyStatsFilters to useTimeSeries', () => {
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: defaultStatsFilters,
                userTimezone: DEFAULT_TIMEZONE,
                granularity: ReportingGranularity.Day,
            })
            const useTimeSeriesSpy = jest
                .fn()
                .mockReturnValue(defaultTimeSeries)

            render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard
                        {...config}
                        useTimeSeries={useTimeSeriesSpy}
                    />
                </Provider>,
            )

            expect(useTimeSeriesSpy).toHaveBeenCalledWith(
                defaultStatsFilters,
                userTimezone,
                granularity,
            )
        })

        it('should pas statsFilterWithLogicalOperators to useTimeSeries', () => {
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: defaultStatsFilters,
                userTimezone: DEFAULT_TIMEZONE,
                granularity: ReportingGranularity.Day,
            })
            const useTimeSeriesSpy = jest
                .fn()
                .mockReturnValue(defaultTimeSeries)

            render(
                <Provider store={mockStore(defaultState)}>
                    <OverviewChartCard
                        {...config}
                        useTimeSeries={useTimeSeriesSpy}
                    />
                </Provider>,
            )

            expect(useTimeSeriesSpy).toHaveBeenCalledWith(
                defaultStatsFilters,
                userTimezone,
                granularity,
            )
        })
    })
})
