import React from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import {
    useMessagesSentTimeSeries,
    useOneTouchTicketsTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
    useZeroTouchTicketsTimeSeries,
} from 'hooks/reporting/timeSeries'
import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters } from 'models/stat/types'
import { CHART_TOOLTIP_TARGET as barChartTooltipTarget } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { CHART_TOOLTIP_TARGET as lineChartTooltipTarget } from 'pages/stats/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { OverviewChartCard } from 'pages/stats/support-performance/components/OverviewChartCard'
import { OverviewChartConfig } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/timeSeries')
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

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<OverviewChartCard />', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
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
        stats: {
            filters: fromLegacyStatsFilters(defaultStatsFilters),
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        jest.resetAllMocks()
        useTicketsCreatedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsClosedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useTicketsRepliedTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useMessagesSentTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useOneTouchTicketsTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useZeroTouchTicketsTimeSeriesMock.mockReturnValue(defaultTimeSeries)
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
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
            useNewStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: fromLegacyStatsFilters(defaultStatsFilters),
                userTimezone: DEFAULT_TIMEZONE,
                granularity: ReportingGranularity.Day,
                isAnalyticsNewFilters: false,
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
                fromLegacyStatsFilters(defaultStatsFilters),
                userTimezone,
                granularity,
            )
        })

        it('should pas statsFilterWithLogicalOperators to useTimeSeries', () => {
            useNewStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: fromLegacyStatsFilters(defaultStatsFilters),
                userTimezone: DEFAULT_TIMEZONE,
                granularity: ReportingGranularity.Day,
                isAnalyticsNewFilters: true,
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
                fromLegacyStatsFilters(defaultStatsFilters),
                userTimezone,
                granularity,
            )
        })
    })
})
