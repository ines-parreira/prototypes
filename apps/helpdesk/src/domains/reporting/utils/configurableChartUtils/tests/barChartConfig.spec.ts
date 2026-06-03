import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    fetchStatsMetricBreakdownPerDimension,
    useStatsMetricBreakdownPerDimension,
} from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { BarChartDimensionDefinition } from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import {
    createBarChartFetch,
    getBarChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/barChartConfig'

jest.mock('domains/reporting/hooks/useStatsMetricBreakdownPerDimension')

const useStatsMetricBreakdownPerDimensionMock = assumeMock(
    useStatsMetricBreakdownPerDimension,
)
const fetchStatsMetricBreakdownPerDimensionMock = assumeMock(
    fetchStatsMetricBreakdownPerDimension,
)

type TestDimension = 'channel' | 'integrationId'

const filters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
} as StatsFilters

const builtQuery: BuiltQuery = {
    measures: [],
    scope: MetricScope.TicketsCreated,
    metricName: 'sentinel-built-query' as MetricName,
}

const dimensionDefinitions: Record<TestDimension, BarChartDimensionDefinition> =
    {
        channel: {
            label: 'Channel',
            graphType: ConfigurableGraphType.Bar,
            formatName: (value) => `channel-${value}`,
        },
        integrationId: {
            label: 'Store',
            graphType: ConfigurableGraphType.Donut,
            formatName: (value) => `store-${value}`,
        },
    }

const buildMetric = (dimensions: TestDimension[]) => ({
    measure: 'averageCsat',
    name: 'Average CSAT',
    metricFormat: 'decimal' as const,
    dimensions,
    queryFactory: jest.fn().mockReturnValue(builtQuery),
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('getBarChartGraphConfig', () => {
    it('builds one config per metric with a grouping per dimension from the registry', () => {
        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        const config = getBarChartGraphConfig(
            [buildMetric(['channel', 'integrationId'])],
            dimensionDefinitions,
            filters,
            'UTC',
        )

        expect(config).toHaveLength(1)
        expect(config[0]).toMatchObject({
            measure: 'averageCsat',
            name: 'Average CSAT',
            metricFormat: 'decimal',
        })
        expect(config[0].dimensions).toEqual([
            expect.objectContaining({
                id: 'channel',
                name: 'Channel',
                configurableGraphType: ConfigurableGraphType.Bar,
            }),
            expect.objectContaining({
                id: 'integrationId',
                name: 'Store',
                configurableGraphType: ConfigurableGraphType.Donut,
            }),
        ])
    })

    it('maps the breakdown values through the dimension formatName', () => {
        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'email', value: 4.5, decile: null },
                    { dimension: 'chat', value: 2, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const config = getBarChartGraphConfig(
            [buildMetric(['channel'])],
            dimensionDefinitions,
            filters,
            'UTC',
        )
        const { result } = renderHook(() =>
            config[0].dimensions[0].useChartData(),
        )

        expect(result.current).toEqual({
            data: [
                { name: 'channel-email', value: 4.5 },
                { name: 'channel-chat', value: 2 },
            ],
            isLoading: false,
        })
    })
})

describe('createBarChartFetch', () => {
    beforeEach(() => {
        fetchStatsMetricBreakdownPerDimensionMock.mockResolvedValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [{ dimension: 'email', value: 4.5, decile: null }],
            },
            isFetching: false,
            isError: false,
        })
    })

    it('fetches the saved measure and dimension and returns CSV files', async () => {
        const metric = buildMetric(['channel'])
        const fetch = createBarChartFetch([metric], dimensionDefinitions)

        const { files } = await fetch(
            'averageCsat',
            'channel',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(fetchStatsMetricBreakdownPerDimensionMock).toHaveBeenCalledWith(
            metric.queryFactory,
            filters,
            'UTC',
            'channel',
        )
        const csv = Object.values(files)[0]
        expect(csv).toContain('Channel')
        expect(csv).toContain('channel-email')
    })

    it('falls back to the first metric and its first dimension for unknown saved values', async () => {
        const metric = buildMetric(['integrationId', 'channel'])
        const fetch = createBarChartFetch([metric], dimensionDefinitions)

        await fetch(
            'unknown-measure',
            'unknown-dimension',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(fetchStatsMetricBreakdownPerDimensionMock).toHaveBeenCalledWith(
            metric.queryFactory,
            filters,
            'UTC',
            'integrationId',
        )
    })

    it('returns no files when there are no metrics', async () => {
        const fetch = createBarChartFetch([], dimensionDefinitions)

        const { files } = await fetch(
            'averageCsat',
            'channel',
            filters,
            'UTC',
            ReportingGranularity.Day,
        )

        expect(files).toEqual({})
        expect(fetchStatsMetricBreakdownPerDimensionMock).not.toHaveBeenCalled()
    })
})
