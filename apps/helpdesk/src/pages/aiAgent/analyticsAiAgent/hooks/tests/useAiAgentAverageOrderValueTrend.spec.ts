import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentAverageOrderValueTrend,
    useAiAgentAverageOrderValueTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAverageOrderValueTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-04-01T00:00:00.000',
        end_datetime: '2026-04-15T23:50:59.999',
    },
}

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
    getStatsTrendHook: jest.fn(() => (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('domains/reporting/hooks/useStatsMetricTrend')
        return mod.default(...args)
    }),
}))
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

describe('useAiAgentAverageOrderValueTrend', () => {
    describe('useAiAgentAverageOrderValueTrend', () => {
        it('should return data from useStatsMetricTrend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAverageOrderValueTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })
        })

        it('should forward isFetching state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAverageOrderValueTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should forward isError state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useAiAgentAverageOrderValueTrend(statsFilters, timezone),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAiAgentAverageOrderValueTrend', () => {
        it('should return data from fetchStatsMetricTrend', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchAiAgentAverageOrderValueTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })
        })

        it('should forward isError when fetchStatsMetricTrend fails', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const result = await fetchAiAgentAverageOrderValueTrend(
                statsFilters,
                timezone,
            )

            expect(result.isError).toBe(true)
        })
    })
})
