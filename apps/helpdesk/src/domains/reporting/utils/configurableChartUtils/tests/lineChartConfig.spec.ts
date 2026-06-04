import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    fetchStatsMetricTimeSeries,
    fetchStatsMetricTimeSeriesPerDimension,
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type {
    LineChartDimension,
    LineChartDimensionDefinition,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'
import {
    createLineChartFetch,
    getLineChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'

jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')

const useStatsMetricTimeSeriesMock = assumeMock(useStatsMetricTimeSeries)
const useStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    useStatsMetricTimeSeriesPerDimension,
)
const fetchStatsMetricTimeSeriesMock = assumeMock(fetchStatsMetricTimeSeries)
const fetchStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    fetchStatsMetricTimeSeriesPerDimension,
)

type TestDimension = 'channel'

const filters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
} as StatsFilters

const dimensionDefinitions: Record<
    LineChartDimension<TestDimension>,
    LineChartDimensionDefinition
> = {
    overall: {
        label: 'Overall',
        formatName: (value) => value,
    },
    channel: {
        label: 'Channel',
        formatName: (value) => `channel-${value}`,
    },
}

const builtQuery: BuiltQuery = {
    measures: [],
    scope: MetricScope.TicketsCreated,
    metricName: 'sentinel-built-query' as MetricName,
}

const buildMetric = (dimensions: LineChartDimension<TestDimension>[]) => ({
    measure: 'averageCsat',
    name: 'Average CSAT',
    metricFormat: 'decimal' as const,
    dimensions,
    queryFactory: jest.fn().mockReturnValue(builtQuery),
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('getLineChartGraphConfig', () => {
    it('builds an overall timeseries grouping and a channel multi-series grouping', () => {
        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[]],
            isFetching: false,
        } as any)
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: {},
            isFetching: false,
        } as any)

        const config = getLineChartGraphConfig(
            [buildMetric(['overall', 'channel'])],
            dimensionDefinitions,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(config).toHaveLength(1)
        expect(config[0]).toMatchObject({
            measure: 'averageCsat',
            name: 'Average CSAT',
            metricFormat: 'decimal',
        })
        expect(config[0].dimensions).toEqual([
            expect.objectContaining({
                id: 'overall',
                name: 'Overall',
                configurableGraphType: ConfigurableGraphType.TimeSeries,
            }),
            expect.objectContaining({
                id: 'channel',
                name: 'Channel',
                configurableGraphType: ConfigurableGraphType.MultipleTimeSeries,
            }),
        ])
    })

    it('maps the overall grouping data to a single timeseries via toTimeSeriesData', () => {
        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 4.5 }]],
            isFetching: false,
        } as any)

        const config = getLineChartGraphConfig(
            [buildMetric(['overall'])],
            dimensionDefinitions,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
        const { result } = renderHook(() =>
            config[0].dimensions[0].useChartData(),
        )

        expect(result.current).toEqual({
            data: [{ date: 'Jan 1', value: 4.5 }],
            isLoading: false,
        })
    })

    it('maps the channel grouping data to labelled series via the dimension formatName', () => {
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: { email: [[{ dateTime: '2024-01-01', value: 2 }]] },
            isFetching: false,
        } as any)

        const config = getLineChartGraphConfig(
            [buildMetric(['channel'])],
            dimensionDefinitions,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
        const { result } = renderHook(() =>
            config[0].dimensions[0].useChartData(),
        )

        expect(result.current).toEqual({
            data: [
                {
                    label: 'channel-email',
                    values: [{ date: 'Jan 1', value: 2 }],
                },
            ],
            isLoading: false,
        })
    })
})

describe('createLineChartFetch', () => {
    it('fetches the overall timeseries and returns CSV files', async () => {
        fetchStatsMetricTimeSeriesMock.mockResolvedValue([
            [{ dateTime: '2024-01-01', value: 4.5 }],
        ])
        const metric = buildMetric(['overall', 'channel'])
        const fetch = createLineChartFetch([metric], dimensionDefinitions)

        const { files } = await fetch(
            'averageCsat',
            'overall',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(fetchStatsMetricTimeSeriesMock).toHaveBeenCalledWith(
            metric.queryFactory,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
        const csv = Object.values(files)[0]
        expect(csv).toContain('Date')
        expect(csv).toContain('Average CSAT')
    })

    it('fetches the channel breakdown timeseries when the channel dimension is saved', async () => {
        fetchStatsMetricTimeSeriesPerDimensionMock.mockResolvedValue({
            email: [[{ dateTime: '2024-01-01', value: 4.5 }]],
        })
        const metric = buildMetric(['overall', 'channel'])
        const fetch = createLineChartFetch([metric], dimensionDefinitions)

        const { files } = await fetch(
            'averageCsat',
            'channel',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(fetchStatsMetricTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            metric.queryFactory,
            filters,
            'UTC',
            ReportingGranularity.Day,
            'channel',
        )
        const csv = Object.values(files)[0]
        expect(csv).toContain('channel-email')
    })

    it('falls back to the first metric and its first dimension for unknown saved values', async () => {
        fetchStatsMetricTimeSeriesMock.mockResolvedValue([
            [{ dateTime: '2024-01-01', value: 4.5 }],
        ])
        const metric = buildMetric(['overall', 'channel'])
        const fetch = createLineChartFetch([metric], dimensionDefinitions)

        await fetch(
            'unknown-measure',
            'unknown-dimension',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(fetchStatsMetricTimeSeriesMock).toHaveBeenCalledWith(
            metric.queryFactory,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
    })

    it('returns no files and fetches nothing when there are no metrics', async () => {
        const fetch = createLineChartFetch([], dimensionDefinitions)

        const result = await fetch(
            'averageCsat',
            'overall',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(result).toEqual({ files: {} })
        expect(fetchStatsMetricTimeSeriesMock).not.toHaveBeenCalled()
        expect(
            fetchStatsMetricTimeSeriesPerDimensionMock,
        ).not.toHaveBeenCalled()
    })
})
