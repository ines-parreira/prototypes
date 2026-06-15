import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import {
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { ChannelsVoiceLineChartMetricConfig } from 'domains/reporting/pages/performance/channels/voice/utils/getChannelsVoiceConfigurableLineGraphConfig'
import { getChannelsVoiceConfigurableLineGraphConfig } from 'domains/reporting/pages/performance/channels/voice/utils/getChannelsVoiceConfigurableLineGraphConfig'

jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')

const useStatsMetricTimeSeriesMock = assumeMock(useStatsMetricTimeSeries)
const useStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    useStatsMetricTimeSeriesPerDimension,
)

const filters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
} as StatsFilters

const metrics: ChannelsVoiceLineChartMetricConfig[] = [
    {
        measure: 'voiceCallsCount',
        name: 'Total calls',
        metricFormat: 'decimal',
        dimensions: ['overall', 'callDirection'],
        queryFactory: jest.fn(),
    },
]

afterEach(() => {
    jest.clearAllMocks()
})

describe('getChannelsVoiceConfigurableLineGraphConfig', () => {
    it('exposes an overall timeseries dimension and a callDirection multi-series dimension', () => {
        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[]],
            isFetching: false,
        } as any)
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: {},
            isFetching: false,
        } as any)

        const config = getChannelsVoiceConfigurableLineGraphConfig(
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
                id: 'callDirection',
                name: 'Call direction',
                configurableGraphType: ConfigurableGraphType.MultipleTimeSeries,
            }),
        ])
    })

    it('capitalizes call direction series labels', () => {
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: { inbound: [[{ dateTime: '2024-01-01', value: 12 }]] },
            isFetching: false,
        } as any)

        const config = getChannelsVoiceConfigurableLineGraphConfig(
            metrics,
            filters,
            'UTC',
            ReportingGranularity.Day,
        )
        const { result } = renderHook(() =>
            config[0].dimensions[1].useChartData(),
        )

        expect(result.current).toEqual({
            data: [
                { label: 'Inbound', values: [{ date: 'Jan 1', value: 12 }] },
            ],
            isLoading: false,
        })
    })
})
