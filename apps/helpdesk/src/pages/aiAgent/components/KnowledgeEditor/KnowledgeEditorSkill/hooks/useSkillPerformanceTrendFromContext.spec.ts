import type { ReactNode } from 'react'
import { createElement } from 'react'

import { renderHook } from '@repo/testing'

import { mockSkillPerformanceChartData } from './SkillPerformanceTrendMockData'
import type { SkillPerformanceData } from './useSkillPerformanceFromContext'
import { SkillPerformanceDataProvider } from './useSkillPerformanceFromContext'
import {
    buildSkillPerformanceChartData,
    useSkillPerformanceTrendFromContext,
} from './useSkillPerformanceTrendFromContext'

const mockDateRange = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-03T23:59:59Z',
}
const mockSkillPerformanceData: SkillPerformanceData = {
    skillMetrics: {
        metrics: {
            tickets: 10,
            prevTickets: 8,
            handoverTickets: 3,
            prevHandoverTickets: 2,
            csat: 4.5,
            prevCsat: 4.3,
            resourceSourceSetId: 100,
        },
        metricsByDay: [
            { date: '2024-01-01', tickets: 4, csat: 4.2 },
            { date: '2024-01-03', tickets: 6, csat: 4.6 },
        ],
        isLoading: false,
        isMetricsByDayLoading: false,
        resourceSourceId: 42,
        resourceSourceSetId: 100,
        shopIntegrationId: 999,
        dateRange: mockDateRange,
        totalAiAgentTickets: 200,
    },
    recentTickets: undefined,
}

const renderSkillPerformanceTrendHook = (
    params?: Parameters<typeof useSkillPerformanceTrendFromContext>[0],
    skillPerformanceData: SkillPerformanceData = mockSkillPerformanceData,
) =>
    renderHook(() => useSkillPerformanceTrendFromContext(params), {
        wrapper: ({ children }: { children: ReactNode }) =>
            createElement(
                SkillPerformanceDataProvider,
                { value: skillPerformanceData },
                children,
            ),
    })

describe('useSkillPerformanceTrendFromContext', () => {
    it('maps temporary mock values onto the active date range when mock data is enabled', () => {
        const { result } = renderSkillPerformanceTrendHook({
            useMockData: true,
        })

        // mockDateRange spans 3 days (2024-01-01 → 2024-01-03), so we expect 3
        // points; the values come from the first 3 entries of the mock array,
        // re-dated to the range. This is what guarantees the chart and CSV
        // export both follow the date picker.
        expect(result.current.chartData).toEqual([
            {
                date: '2024-01-01',
                ticketVolume: mockSkillPerformanceChartData[0].ticketVolume,
                csat: mockSkillPerformanceChartData[0].csat,
            },
            {
                date: '2024-01-02',
                ticketVolume: mockSkillPerformanceChartData[1].ticketVolume,
                csat: mockSkillPerformanceChartData[1].csat,
            },
            {
                date: '2024-01-03',
                ticketVolume: mockSkillPerformanceChartData[2].ticketVolume,
                csat: mockSkillPerformanceChartData[2].csat,
            },
        ])
        expect(result.current.isLoading).toBe(false)
    })

    it('builds per-day chart data when mock data is disabled', () => {
        const { result } = renderSkillPerformanceTrendHook({
            useMockData: false,
        })

        expect(result.current.chartData).toEqual([
            { date: '2024-01-01', ticketVolume: 4, csat: 4.2 },
            { date: '2024-01-02', ticketVolume: 0, csat: null },
            { date: '2024-01-03', ticketVolume: 6, csat: 4.6 },
        ])
    })

    it('uses the date range from the shared skill performance data', () => {
        const historicalDateRange = {
            start_datetime: '2024-02-01T00:00:00Z',
            end_datetime: '2024-02-28T23:59:59Z',
        }
        const skillPerformanceData = {
            ...mockSkillPerformanceData,
            skillMetrics: {
                ...mockSkillPerformanceData.skillMetrics,
                dateRange: historicalDateRange,
            },
        }

        const { result } = renderSkillPerformanceTrendHook(
            { useMockData: false },
            skillPerformanceData,
        )

        expect(result.current.dateRange).toBe(historicalDateRange)
    })

    it('forwards the per-day loading state when daily metrics are loading', () => {
        const { result } = renderSkillPerformanceTrendHook(
            { useMockData: false },
            {
                ...mockSkillPerformanceData,
                skillMetrics: {
                    ...mockSkillPerformanceData.skillMetrics,
                    metricsByDay: null,
                    isMetricsByDayLoading: true,
                },
            },
        )

        expect(result.current.chartData).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })
})

describe('buildSkillPerformanceChartData', () => {
    it('returns an empty chart dataset when per-day metrics are not available', () => {
        expect(buildSkillPerformanceChartData(null, mockDateRange)).toEqual([])
    })

    it('returns an empty chart dataset when there are no daily metrics so the no-data placeholder can render', () => {
        expect(buildSkillPerformanceChartData([], mockDateRange)).toEqual([])
    })

    it('zero-fills ticket volume and gaps csat for days missing from the per-day metrics', () => {
        expect(
            buildSkillPerformanceChartData(
                [{ date: '2024-01-02', tickets: 10, csat: 4.3 }],
                mockDateRange,
            ),
        ).toEqual([
            { date: '2024-01-01', ticketVolume: 0, csat: null },
            { date: '2024-01-02', ticketVolume: 10, csat: 4.3 },
            { date: '2024-01-03', ticketVolume: 0, csat: null },
        ])
    })

    it('passes per-day csat through unchanged, surfacing null when the entry has none', () => {
        const result = buildSkillPerformanceChartData(
            [
                { date: '2024-01-01', tickets: 4, csat: 4.5 },
                { date: '2024-01-02', tickets: 10, csat: null },
                { date: '2024-01-03', tickets: 8, csat: 3.8 },
            ],
            mockDateRange,
        )

        expect(result.map((item) => item.csat)).toEqual([4.5, null, 3.8])
    })
})
