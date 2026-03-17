import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    useStatsTimeSeries,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import {
    getBarChartDataHooks,
    getBarChartGraphConfig,
    getLineChartDataHooks,
    getLineChartGraphConfig,
    useAutomationMetricPerAutomationFeatureType,
    useAutomationMetricPerChannel,
    useAutomationTimeSeriesPerAutomationFeatureType,
    useAutomationTimeSeriesPerChannel,
    useOverallTimeSeries,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type {
    BarChartMetricConfig,
    LineChartMetricConfig,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/hooks/useStatsTimeSeries')
jest.mock('pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod')

const useStatsMetricPerDimensionMock = assumeMock(useStatsMetricPerDimension)
const getStatsTrendHookMock = assumeMock(getStatsTrendHook)
const useStatsTimeSeriesMock = assumeMock(useStatsTimeSeries)
const useStatsTimeSeriesPerDimensionMock = assumeMock(
    useStatsTimeSeriesPerDimension,
)
const formatPreviousPeriodMock = assumeMock(formatPreviousPeriod)

const defaultDimensionResult = {
    data: null,
    isFetching: false,
    isError: false,
}

const mockQuery = jest.fn()

const defaultFilters: StatsFilters = {
    period: {
        start_datetime: '2025-01-01T00:00:00.000',
        end_datetime: '2025-01-31T23:59:59.000',
    },
}

const defaultTimezone = 'UTC'

describe('useAutomationMetricPerAutomationFeatureType', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should map known automation feature types to their display names', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: {
                allValues: [
                    {
                        dimension: AutomationFeatureType.AiAgent,
                        value: 10,
                    },
                    {
                        dimension: AutomationFeatureType.Flows,
                        value: 20,
                    },
                    {
                        dimension: AutomationFeatureType.OrderManagement,
                        value: 30,
                    },
                    {
                        dimension: AutomationFeatureType.ArticleRecommendation,
                        value: 40,
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([
            { name: 'AI Agent', value: 10 },
            { name: 'Flows', value: 20 },
            { name: 'Order Management', value: 30 },
            { name: 'Article Recommendation', value: 40 },
        ])
    })

    it('should filter out unknown automation feature types', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: {
                allValues: [
                    {
                        dimension: AutomationFeatureType.AiAgent,
                        value: 10,
                    },
                    { dimension: 'unknown-feature', value: 99 },
                ],
            },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([{ name: 'AI Agent', value: 10 }])
    })

    it('should return empty array when allValues is undefined', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: { allValues: undefined },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return empty array when data is null', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: null,
        })

        const { result } = renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return isLoading derived from isFetching', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            isFetching: true,
            data: null,
        })

        const { result } = renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call query and useStatsMetricPerDimension with automationFeatureType dimension', () => {
        const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
        mockQuery.mockReturnValue(mockBuiltQuery)
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: null,
        })

        renderHook(() =>
            useAutomationMetricPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(mockQuery).toHaveBeenCalledWith({
            filters: defaultFilters,
            timezone: defaultTimezone,
            dimensions: ['automationFeatureType'],
        })
        expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            mockBuiltQuery,
            'automationFeatureType',
        )
    })
})

describe('useAutomationMetricPerChannel', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should map known channel names to their display names', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: {
                allValues: [
                    { dimension: 'email', value: 100 },
                    { dimension: 'chat', value: 200 },
                    { dimension: 'sms', value: 50 },
                    { dimension: 'contact-form', value: 75 },
                    { dimension: 'contact_form', value: 80 },
                    { dimension: 'help-center', value: 60 },
                    { dimension: 'voice', value: 30 },
                ],
            },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([
            { name: 'Email', value: 100 },
            { name: 'Chat', value: 200 },
            { name: 'SMS', value: 50 },
            { name: 'Contact Form', value: 75 },
            { name: 'Contact Form', value: 80 },
            { name: 'Help Center', value: 60 },
            { name: 'Voice', value: 30 },
        ])
    })

    it('should return an unknown channel name as-is', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: {
                allValues: [{ dimension: 'unknown-channel', value: 10 }],
            },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([
            { name: 'unknown-channel', value: 10 },
        ])
    })

    it('should return empty array when allValues is undefined', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: { allValues: undefined },
        } as any)

        const { result } = renderHook(() =>
            useAutomationMetricPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return isLoading derived from isFetching', () => {
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            isFetching: true,
            data: null,
        })

        const { result } = renderHook(() =>
            useAutomationMetricPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call query and useStatsMetricPerDimension with channel dimension', () => {
        const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
        mockQuery.mockReturnValue(mockBuiltQuery)
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: null,
        })

        renderHook(() =>
            useAutomationMetricPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
            ),
        )

        expect(mockQuery).toHaveBeenCalledWith({
            filters: defaultFilters,
            timezone: defaultTimezone,
            dimensions: ['channel'],
        })
        expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            mockBuiltQuery,
            'channel',
        )
    })
})

describe('getBarChartDataHooks', () => {
    const mockTrendHook = jest.fn()
    const mockTrendResult = {
        isFetching: false,
        isError: false,
        data: undefined,
    }
    const period = {
        start_datetime: 'Jan 1, 2025',
        end_datetime: 'Jan 31, 2025',
    }

    beforeEach(() => {
        jest.resetAllMocks()
        getStatsTrendHookMock.mockReturnValue(mockTrendHook)
        mockTrendHook.mockReturnValue(mockTrendResult)
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: null,
        })
    })

    it('should return useTrendData that calls getStatsTrendHook with the query', () => {
        const { useTrendData } = getBarChartDataHooks(
            mockQuery,
            ['channel'],
            defaultFilters,
            defaultTimezone,
            period,
        )

        renderHook(() => useTrendData())

        expect(getStatsTrendHookMock).toHaveBeenCalledWith(mockQuery)
        expect(mockTrendHook).toHaveBeenCalledWith(
            defaultFilters,
            defaultTimezone,
        )
    })

    it('should return channel dimension config with correct shape', () => {
        const { dimensions } = getBarChartDataHooks(
            mockQuery,
            ['channel'],
            defaultFilters,
            defaultTimezone,
            period,
        )

        expect(dimensions).toHaveLength(1)
        expect(dimensions[0]).toMatchObject({
            id: 'channel',
            name: 'Channel',
            configurableGraphType: ConfigurableGraphType.Bar,
            period,
        })
        expect(dimensions[0].valueFormatter).toBeUndefined()
    })

    it('should return all requested dimensions', () => {
        const { dimensions } = getBarChartDataHooks(
            mockQuery,
            ['channel', 'automationFeatureType'],
            defaultFilters,
            defaultTimezone,
            period,
        )

        expect(dimensions).toHaveLength(2)
        expect(dimensions[0].id).toBe('channel')
        expect(dimensions[1].id).toBe('automationFeatureType')
    })

    it('should pass through the period to dimension configs when provided', () => {
        const customPeriod = {
            start_datetime: 'Feb 1, 2025',
            end_datetime: 'Feb 28, 2025',
        }
        const { dimensions } = getBarChartDataHooks(
            mockQuery,
            ['channel'],
            defaultFilters,
            defaultTimezone,
            customPeriod,
        )

        const dimension = dimensions[0]
        expect(dimension.configurableGraphType).toEqual('bar')
        if (
            dimension.configurableGraphType === 'bar' ||
            dimension.configurableGraphType === 'donut'
        ) {
            expect(dimension.period).toEqual(customPeriod)
        }
    })
})

describe('getBarChartGraphConfig', () => {
    const mockTrendHook = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
        getStatsTrendHookMock.mockReturnValue(mockTrendHook)
        mockTrendHook.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        useStatsMetricPerDimensionMock.mockReturnValue({
            ...defaultDimensionResult,
            data: null,
        })
        formatPreviousPeriodMock.mockReturnValue('Dec 1, 2024 - Dec 31, 2024')
    })

    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2025-01-01T00:00:00.000',
            end_datetime: '2025-01-31T23:59:59.000',
        },
    }

    it('should map metric config fields to the output', () => {
        const metrics: BarChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                dimensions: ['channel'] as const,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                queryFactory: mockQuery,
            },
        ]

        const result = getBarChartGraphConfig(metrics, statsFilters, 'UTC')

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            measure: 'automationRate',
            name: 'Automation Rate',
        })
    })

    it('should include tooltipData with period from formatPreviousPeriod', () => {
        const metrics: BarChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                dimensions: ['channel'] as const,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                queryFactory: mockQuery,
            },
        ]

        const result = getBarChartGraphConfig(metrics, statsFilters, 'UTC')

        expect(formatPreviousPeriodMock).toHaveBeenCalledWith(
            statsFilters.period,
        )
        expect(result[0].tooltipData).toEqual({
            period: 'Dec 1, 2024 - Dec 31, 2024',
        })
    })

    it('should pass metricFormat and interpretAs when provided', () => {
        const metrics: BarChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'percentage' as any,
                interpretAs: 'positive' as any,
                dimensions: ['channel'] as const,
                queryFactory: mockQuery,
            },
        ]

        const result = getBarChartGraphConfig(metrics, statsFilters, 'UTC')

        expect(result[0]).toMatchObject({
            metricFormat: 'percentage',
            interpretAs: 'positive',
        })
    })

    it('should map multiple metrics', () => {
        const metrics: BarChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                dimensions: ['channel'] as const,
                queryFactory: mockQuery,
            },
            {
                measure: 'resolvedInteractions',
                name: 'Resolved Interactions',
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                dimensions: ['automationFeatureType'] as const,
                queryFactory: mockQuery,
            },
        ]

        const result = getBarChartGraphConfig(metrics, statsFilters, 'UTC')

        expect(result).toHaveLength(2)
        expect(result[0].measure).toBe('automationRate')
        expect(result[1].measure).toBe('resolvedInteractions')
    })

    it('should include useTrendData and dimensions from getBarChartDataHooks', () => {
        const metrics: BarChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                dimensions: ['channel'] as const,
                queryFactory: mockQuery,
            },
        ]

        const result = getBarChartGraphConfig(metrics, statsFilters, 'UTC')

        expect(typeof result[0].useTrendData).toBe('function')
        expect(Array.isArray(result[0].dimensions)).toBe(true)
    })
})

describe('useOverallTimeSeries', () => {
    const defaultGranularity = ReportingGranularity.Day

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should map data from the first time series to date/value pairs', () => {
        useStatsTimeSeriesMock.mockReturnValue({
            data: [[{ dateTime: '2025-01-01', value: 100 }]],
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useOverallTimeSeries(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([{ date: 'Jan 1', value: 100 }])
    })

    it('should return empty array when data is undefined', () => {
        useStatsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useOverallTimeSeries(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return isLoading derived from isFetching', () => {
        useStatsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: true,
        } as any)

        const { result } = renderHook(() =>
            useOverallTimeSeries(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call query with filters, timezone, and granularity', () => {
        const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
        mockQuery.mockReturnValue(mockBuiltQuery)
        useStatsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        renderHook(() =>
            useOverallTimeSeries(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(mockQuery).toHaveBeenCalledWith({
            filters: defaultFilters,
            timezone: defaultTimezone,
            granularity: defaultGranularity,
        })
        expect(useStatsTimeSeriesMock).toHaveBeenCalledWith(mockBuiltQuery)
    })
})

describe('useAutomationTimeSeriesPerAutomationFeatureType', () => {
    const defaultGranularity = ReportingGranularity.Day

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should map known automation feature types to MultipleTimeSeriesDataItem', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: {
                [AutomationFeatureType.AiAgent]: [
                    [{ dateTime: '2025-01-01', value: 80 }],
                ],
                [AutomationFeatureType.Flows]: [
                    [{ dateTime: '2025-01-01', value: 60 }],
                ],
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([
            {
                label: 'AI Agent',
                values: [{ date: 'Jan 1', value: 80 }],
            },
            {
                label: 'Flows',
                values: [{ date: 'Jan 1', value: 60 }],
            },
        ])
    })

    it('should filter out unknown automation feature types', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: {
                [AutomationFeatureType.AiAgent]: [
                    [{ dateTime: '2025-01-01', value: 80 }],
                ],
                'unknown-feature': [[{ dateTime: '2025-01-01', value: 99 }]],
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toHaveLength(1)
        expect(result.current.data[0].label).toBe('AI Agent')
    })

    it('should return empty array when data is undefined', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return isLoading derived from isFetching', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: true,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call query with filters, timezone, automationFeatureType dimension, and granularity', () => {
        const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
        mockQuery.mockReturnValue(mockBuiltQuery)
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        renderHook(() =>
            useAutomationTimeSeriesPerAutomationFeatureType(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(mockQuery).toHaveBeenCalledWith({
            filters: defaultFilters,
            timezone: defaultTimezone,
            dimensions: ['automationFeatureType'],
            granularity: defaultGranularity,
        })
        expect(useStatsTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            mockBuiltQuery,
        )
    })
})

describe('useAutomationTimeSeriesPerChannel', () => {
    const defaultGranularity = ReportingGranularity.Day

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should map channels to MultipleTimeSeriesDataItem with formatted channel names', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: {
                email: [[{ dateTime: '2025-01-01', value: 100 }]],
                chat: [[{ dateTime: '2025-01-01', value: 50 }]],
            },
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([
            {
                label: 'Email',
                values: [{ date: 'Jan 1', value: 100 }],
            },
            {
                label: 'Chat',
                values: [{ date: 'Jan 1', value: 50 }],
            },
        ])
    })

    it('should return empty array when data is undefined', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.data).toEqual([])
    })

    it('should return isLoading derived from isFetching', () => {
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: true,
        } as any)

        const { result } = renderHook(() =>
            useAutomationTimeSeriesPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should call query with filters, timezone, channel dimension, and granularity', () => {
        const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
        mockQuery.mockReturnValue(mockBuiltQuery)
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)

        renderHook(() =>
            useAutomationTimeSeriesPerChannel(
                mockQuery,
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            ),
        )

        expect(mockQuery).toHaveBeenCalledWith({
            filters: defaultFilters,
            timezone: defaultTimezone,
            dimensions: ['channel'],
            granularity: defaultGranularity,
        })
    })
})

describe('getLineChartDataHooks', () => {
    const mockTrendHook = jest.fn()
    const mockTrendQuery = jest.fn()
    const mockTimeSeriesQuery = jest.fn()
    const defaultGranularity = ReportingGranularity.Day

    beforeEach(() => {
        jest.resetAllMocks()
        getStatsTrendHookMock.mockReturnValue(mockTrendHook)
        mockTrendHook.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        useStatsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
    })

    it('should return useTrendData that calls getStatsTrendHook with the trend query', () => {
        const { useTrendData } = getLineChartDataHooks(
            mockTrendQuery,
            mockTimeSeriesQuery,
            ['overall'],
            defaultFilters,
            defaultTimezone,
            defaultGranularity,
        )

        renderHook(() => useTrendData())

        expect(getStatsTrendHookMock).toHaveBeenCalledWith(mockTrendQuery)
        expect(mockTrendHook).toHaveBeenCalledWith(
            defaultFilters,
            defaultTimezone,
        )
    })

    it('should return overall dimension config with TimeSeries chart type', () => {
        const { dimensions } = getLineChartDataHooks(
            mockTrendQuery,
            mockTimeSeriesQuery,
            ['overall'],
            defaultFilters,
            defaultTimezone,
            defaultGranularity,
        )

        expect(dimensions).toHaveLength(1)
        expect(dimensions[0]).toMatchObject({
            id: 'overall',
            name: 'Overall',
            configurableGraphType: ConfigurableGraphType.TimeSeries,
        })
    })

    it('should return channel dimension config with MultipleTimeSeries chart type', () => {
        const { dimensions } = getLineChartDataHooks(
            mockTrendQuery,
            mockTimeSeriesQuery,
            ['channel'],
            defaultFilters,
            defaultTimezone,
            defaultGranularity,
        )

        expect(dimensions).toHaveLength(1)
        expect(dimensions[0]).toMatchObject({
            id: 'channel',
            name: 'Channel',
            configurableGraphType: ConfigurableGraphType.MultipleTimeSeries,
        })
    })

    it('should return automationFeatureType dimension config with MultipleTimeSeries chart type', () => {
        const { dimensions } = getLineChartDataHooks(
            mockTrendQuery,
            mockTimeSeriesQuery,
            ['automationFeatureType'],
            defaultFilters,
            defaultTimezone,
            defaultGranularity,
        )

        expect(dimensions).toHaveLength(1)
        expect(dimensions[0]).toMatchObject({
            id: 'automationFeatureType',
            name: 'Feature',
            configurableGraphType: ConfigurableGraphType.MultipleTimeSeries,
        })
    })

    it('should return all requested dimensions', () => {
        const { dimensions } = getLineChartDataHooks(
            mockTrendQuery,
            mockTimeSeriesQuery,
            ['overall', 'channel', 'automationFeatureType'],
            defaultFilters,
            defaultTimezone,
            defaultGranularity,
        )

        expect(dimensions).toHaveLength(3)
        expect(dimensions[0].id).toBe('overall')
        expect(dimensions[1].id).toBe('channel')
        expect(dimensions[2].id).toBe('automationFeatureType')
    })

    describe('useChartData hooks', () => {
        it('overall useChartData calls useStatsTimeSeries with the time series query and returns formatted data', () => {
            const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
            mockTimeSeriesQuery.mockReturnValue(mockBuiltQuery)
            useStatsTimeSeriesMock.mockReturnValue({
                data: [[{ dateTime: '2025-01-01', value: 42 }]],
                isFetching: false,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['overall'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(mockTimeSeriesQuery).toHaveBeenCalledWith({
                filters: defaultFilters,
                timezone: defaultTimezone,
                granularity: defaultGranularity,
            })
            expect(useStatsTimeSeriesMock).toHaveBeenCalledWith(mockBuiltQuery)
            expect(result.current.data).toEqual([{ date: 'Jan 1', value: 42 }])
            expect(result.current.isLoading).toBe(false)
        })

        it('overall useChartData returns isLoading true when fetching', () => {
            useStatsTimeSeriesMock.mockReturnValue({
                data: undefined,
                isFetching: true,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['overall'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(result.current.isLoading).toBe(true)
        })

        it('channel useChartData calls useStatsTimeSeriesPerDimension with channel dimension and returns formatted data', () => {
            const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
            mockTimeSeriesQuery.mockReturnValue(mockBuiltQuery)
            useStatsTimeSeriesPerDimensionMock.mockReturnValue({
                data: {
                    email: [[{ dateTime: '2025-01-01', value: 100 }]],
                    chat: [[{ dateTime: '2025-01-01', value: 50 }]],
                },
                isFetching: false,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['channel'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(mockTimeSeriesQuery).toHaveBeenCalledWith({
                filters: defaultFilters,
                timezone: defaultTimezone,
                dimensions: ['channel'],
                granularity: defaultGranularity,
            })
            expect(result.current.data).toEqual([
                { label: 'Email', values: [{ date: 'Jan 1', value: 100 }] },
                { label: 'Chat', values: [{ date: 'Jan 1', value: 50 }] },
            ])
            expect(result.current.isLoading).toBe(false)
        })

        it('channel useChartData returns isLoading true when fetching', () => {
            useStatsTimeSeriesPerDimensionMock.mockReturnValue({
                data: undefined,
                isFetching: true,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['channel'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(result.current.isLoading).toBe(true)
        })

        it('automationFeatureType useChartData calls useStatsTimeSeriesPerDimension with automationFeatureType dimension and returns formatted data', () => {
            const mockBuiltQuery = { scope: 'test', measures: [], filters: [] }
            mockTimeSeriesQuery.mockReturnValue(mockBuiltQuery)
            useStatsTimeSeriesPerDimensionMock.mockReturnValue({
                data: {
                    [AutomationFeatureType.AiAgent]: [
                        [{ dateTime: '2025-01-01', value: 80 }],
                    ],
                    [AutomationFeatureType.Flows]: [
                        [{ dateTime: '2025-01-01', value: 60 }],
                    ],
                },
                isFetching: false,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['automationFeatureType'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(mockTimeSeriesQuery).toHaveBeenCalledWith({
                filters: defaultFilters,
                timezone: defaultTimezone,
                dimensions: ['automationFeatureType'],
                granularity: defaultGranularity,
            })
            expect(result.current.data).toEqual([
                {
                    label: 'AI Agent',
                    values: [{ date: 'Jan 1', value: 80 }],
                },
                {
                    label: 'Flows',
                    values: [{ date: 'Jan 1', value: 60 }],
                },
            ])
            expect(result.current.isLoading).toBe(false)
        })

        it('automationFeatureType useChartData returns isLoading true when fetching', () => {
            useStatsTimeSeriesPerDimensionMock.mockReturnValue({
                data: undefined,
                isFetching: true,
            } as any)

            const { dimensions } = getLineChartDataHooks(
                mockTrendQuery,
                mockTimeSeriesQuery,
                ['automationFeatureType'],
                defaultFilters,
                defaultTimezone,
                defaultGranularity,
            )

            const { result } = renderHook(() => dimensions[0].useChartData())

            expect(result.current.isLoading).toBe(true)
        })
    })
})

describe('getLineChartGraphConfig', () => {
    const mockTrendHook = jest.fn()
    const mockTrendQuery = jest.fn()
    const mockTimeSeriesQuery = jest.fn()
    const defaultGranularity = ReportingGranularity.Day

    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2025-01-01T00:00:00.000',
            end_datetime: '2025-01-31T23:59:59.000',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        getStatsTrendHookMock.mockReturnValue(mockTrendHook)
        mockTrendHook.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })
        useStatsTimeSeriesMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
        useStatsTimeSeriesPerDimensionMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as any)
        formatPreviousPeriodMock.mockReturnValue('Dec 1, 2024 - Dec 31, 2024')
    })

    it('should map metric config fields to the output', () => {
        const metrics: LineChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
                dimensions: ['overall'],
                trendQueryFactory: mockTrendQuery,
                timeSeriesQueryFactory: mockTimeSeriesQuery,
            },
        ]

        const result = getLineChartGraphConfig(
            metrics,
            statsFilters,
            'UTC',
            defaultGranularity,
        )

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            measure: 'automationRate',
            name: 'Automation Rate',
            metricFormat: 'decimal-to-percent',
            interpretAs: 'more-is-better',
        })
    })

    it('should include tooltipData with period from formatPreviousPeriod', () => {
        const metrics: LineChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
                dimensions: ['overall'],
                trendQueryFactory: mockTrendQuery,
                timeSeriesQueryFactory: mockTimeSeriesQuery,
            },
        ]

        const result = getLineChartGraphConfig(
            metrics,
            statsFilters,
            'UTC',
            defaultGranularity,
        )

        expect(formatPreviousPeriodMock).toHaveBeenCalledWith(
            statsFilters.period,
        )
        expect(result[0].tooltipData).toEqual({
            period: 'Dec 1, 2024 - Dec 31, 2024',
        })
    })

    it('should include useTrendData and dimensions from getLineChartDataHooks', () => {
        const metrics: LineChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
                dimensions: ['overall', 'channel'],
                trendQueryFactory: mockTrendQuery,
                timeSeriesQueryFactory: mockTimeSeriesQuery,
            },
        ]

        const result = getLineChartGraphConfig(
            metrics,
            statsFilters,
            'UTC',
            defaultGranularity,
        )

        expect(typeof result[0].useTrendData).toBe('function')
        expect(result[0].dimensions).toHaveLength(2)
    })

    it('should map multiple metrics', () => {
        const metrics: LineChartMetricConfig[] = [
            {
                measure: 'automationRate',
                name: 'Automation Rate',
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
                dimensions: ['overall'],
                trendQueryFactory: mockTrendQuery,
                timeSeriesQueryFactory: mockTimeSeriesQuery,
            },
            {
                measure: 'resolvedInteractions',
                name: 'Resolved Interactions',
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
                dimensions: ['channel'],
                trendQueryFactory: mockTrendQuery,
                timeSeriesQueryFactory: mockTimeSeriesQuery,
            },
        ]

        const result = getLineChartGraphConfig(
            metrics,
            statsFilters,
            'UTC',
            defaultGranularity,
        )

        expect(result).toHaveLength(2)
        expect(result[0].measure).toBe('automationRate')
        expect(result[1].measure).toBe('resolvedInteractions')
    })
})
