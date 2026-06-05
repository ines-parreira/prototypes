import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import { useStatsMetricBreakdownPerDimension } from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { PerformanceBarChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'
import { getPerformanceConfigurableBarGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'

jest.mock('domains/reporting/hooks/useStatsMetricBreakdownPerDimension')

const useStatsMetricBreakdownPerDimensionMock = assumeMock(
    useStatsMetricBreakdownPerDimension,
)

const filters = {
    period: {
        start_datetime: '2024-01-01',
        end_datetime: '2024-01-31',
    },
} as StatsFilters

const metrics: PerformanceBarChartMetricConfig[] = [
    {
        measure: 'averageCsat',
        name: 'Average CSAT',
        metricFormat: 'decimal',
        dimensions: ['channel'],
        queryFactory: jest.fn(),
    },
    {
        measure: 'resolutionTime',
        name: 'Resolution time',
        metricFormat: 'duration',
        dimensions: ['channel'],
        queryFactory: jest.fn(),
    },
]

afterEach(() => {
    jest.clearAllMocks()
})

describe('getPerformanceConfigurableBarGraphConfig', () => {
    it('returns one config per metric, each with a single channel horizontal bar dimension', () => {
        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        const config = getPerformanceConfigurableBarGraphConfig(
            metrics,
            filters,
            'UTC',
        )

        expect(config).toHaveLength(2)
        expect(config[0]).toMatchObject({
            measure: 'averageCsat',
            name: 'Average CSAT',
            metricFormat: 'decimal',
        })
        expect(config[0].dimensions).toHaveLength(1)
        expect(config[0].dimensions[0]).toMatchObject({
            id: 'channel',
            name: 'Channel',
            configurableGraphType: ConfigurableGraphType.HorizontalBar,
        })
    })

    it('maps per-channel values to humanized chart data items', () => {
        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'email', value: 4.5, decile: null },
                    { dimension: 'chat', value: 4.7, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const config = getPerformanceConfigurableBarGraphConfig(
            metrics,
            filters,
            'UTC',
        )
        const { result } = renderHook(() =>
            config[0].dimensions[0].useChartData(),
        )

        expect(result.current).toEqual({
            data: [
                { name: 'Email', value: 4.5 },
                { name: 'Chat', value: 4.7 },
            ],
            isLoading: false,
        })
    })

    it('returns empty data and reflects the fetching state', () => {
        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const config = getPerformanceConfigurableBarGraphConfig(
            metrics,
            filters,
            'UTC',
        )
        const { result } = renderHook(() =>
            config[0].dimensions[0].useChartData(),
        )

        expect(result.current).toEqual({ data: [], isLoading: true })
    })
})
