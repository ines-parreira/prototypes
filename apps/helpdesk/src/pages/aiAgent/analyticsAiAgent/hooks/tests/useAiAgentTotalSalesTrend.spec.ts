import { assumeMock, renderHook } from '@repo/testing'

import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentTotalSalesTrend,
    useAiAgentTotalSalesTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTotalSalesTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-04-01T00:00:00.000',
        end_datetime: '2026-04-15T23:50:59.999',
    },
}

jest.mock('domains/reporting/hooks/useMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchMetricTrend: jest.fn(),
}))
const mockUseMetricTrend = assumeMock(useMetricTrend)
const mockFetchMetricTrend = assumeMock(fetchMetricTrend)

describe('useAiAgentTotalSalesTrend', () => {
    describe('useAiAgentTotalSalesTrend', () => {
        it('should return data from useMetricTrend', () => {
            mockUseMetricTrend.mockReturnValue({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentTotalSalesTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })
        })

        it('should forward isFetching state', () => {
            mockUseMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentTotalSalesTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should forward isError state', () => {
            mockUseMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useAiAgentTotalSalesTrend(statsFilters, timezone),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAiAgentTotalSalesTrend', () => {
        it('should return data from fetchMetricTrend', async () => {
            mockFetchMetricTrend.mockResolvedValue({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchAiAgentTotalSalesTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: { value: 1234.56, prevValue: 1000.0 },
                isFetching: false,
                isError: false,
            })
        })

        it('should forward isError when fetchMetricTrend fails', async () => {
            mockFetchMetricTrend.mockResolvedValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const result = await fetchAiAgentTotalSalesTrend(
                statsFilters,
                timezone,
            )

            expect(result.isError).toBe(true)
        })
    })
})
