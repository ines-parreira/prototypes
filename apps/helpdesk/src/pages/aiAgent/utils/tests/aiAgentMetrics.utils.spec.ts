import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, renderHook } from '@repo/testing'

import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import {
    getBarChartDataHooks,
    getBarChartGraphConfig,
    useAutomationMetricPerAutomationFeatureType,
    useAutomationMetricPerChannel,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { BarChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod')

const useStatsMetricPerDimensionMock = assumeMock(useStatsMetricPerDimension)
const getStatsTrendHookMock = assumeMock(getStatsTrendHook)
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
            chartType: ConfigurableGraphType.Bar,
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
        expect(dimension.chartType).toEqual('bar')
        if (dimension.chartType === 'bar' || dimension.chartType === 'donut') {
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
