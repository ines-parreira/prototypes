import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import {
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { PerformanceLineChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableLineGraphConfig'
import { getPerformanceWithSubChannelsConfigurableLineGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceWithSubChannelsConfigurableLineGraphConfig'

jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')

const useStatsMetricTimeSeriesMock = assumeMock(useStatsMetricTimeSeries)
const useStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    useStatsMetricTimeSeriesPerDimension,
)

const filters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
} as StatsFilters

const metrics: PerformanceLineChartMetricConfig[] = [
    {
        measure: 'createdTickets',
        name: 'Email tickets created',
        metricFormat: 'decimal',
        dimensions: ['overall', 'channel'],
        queryFactory: jest.fn(),
    },
]

afterEach(() => {
    jest.clearAllMocks()
})

describe('getPerformanceWithSubChannelsConfigurableLineGraphConfig', () => {
    it('exposes an overall timeseries dimension and a sub-channel multi-series dimension', () => {
        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[]],
            isFetching: false,
        } as any)
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: {},
            isFetching: false,
        } as any)

        const config = getPerformanceWithSubChannelsConfigurableLineGraphConfig(
            metrics,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(config).toHaveLength(1)
        expect(config[0].dimensions).toEqual([
            expect.objectContaining({
                id: 'overall',
                name: 'Overall',
                configurableGraphType: ConfigurableGraphType.TimeSeries,
            }),
            expect.objectContaining({
                id: 'channel',
                name: 'Sub-channel',
                configurableGraphType: ConfigurableGraphType.MultipleTimeSeries,
            }),
        ])
    })

    it('humanizes sub-channel series labels', () => {
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: { email: [[{ dateTime: '2024-01-01', value: 4.5 }]] },
            isFetching: false,
        } as any)

        const config = getPerformanceWithSubChannelsConfigurableLineGraphConfig(
            metrics,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
        const { result } = renderHook(() =>
            config[0].dimensions[1].useChartData(),
        )

        expect(result.current).toEqual({
            data: [{ label: 'Email', values: [{ date: 'Jan 1', value: 4.5 }] }],
            isLoading: false,
        })
    })
})
