import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentAllAgentsResolutionTimeTrend,
    useAiAgentAllAgentsResolutionTimeTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsResolutionTimeTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-04-01T00:00:00.000',
        end_datetime: '2026-04-15T23:50:59.999',
    },
}

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    useStatsMetricTrend: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
    getStatsTrendHook: jest.fn(() => (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('domains/reporting/hooks/useStatsMetricTrend')
        return mod.useStatsMetricTrend(...args)
    }),
    getStatsTrendFetch: jest.fn(() => (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('domains/reporting/hooks/useStatsMetricTrend')
        return mod.fetchStatsMetricTrend(...args)
    }),
}))
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')

const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockUseAIAgentUserId = assumeMock(useAIAgentUserId)

describe('useAiAgentAllAgentsResolutionTimeTrend', () => {
    describe('useAiAgentAllAgentsResolutionTimeTrend', () => {
        it('should return data from useStatsMetricTrend', () => {
            mockUseAIAgentUserId.mockReturnValue(undefined)
            mockUseStatsMetricTrend.mockReturnValue({
                data: { value: 7200, prevValue: 8400 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAllAgentsResolutionTimeTrend(statsFilters, timezone),
            )

            expect(result.current).toEqual({
                data: { value: 7200, prevValue: 8400 },
                isFetching: false,
                isError: false,
            })
        })

        it('should forward isFetching state', () => {
            mockUseAIAgentUserId.mockReturnValue(undefined)
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAllAgentsResolutionTimeTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(false)
        })

        it('should forward isError state', () => {
            mockUseAIAgentUserId.mockReturnValue(undefined)
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useAiAgentAllAgentsResolutionTimeTrend(statsFilters, timezone),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAiAgentAllAgentsResolutionTimeTrend', () => {
        it('should return data from fetchStatsMetricTrend', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: { value: 7200, prevValue: 8400 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchAiAgentAllAgentsResolutionTimeTrend(
                statsFilters,
                timezone,
                undefined,
            )

            expect(result).toEqual({
                data: { value: 7200, prevValue: 8400 },
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

            const result = await fetchAiAgentAllAgentsResolutionTimeTrend(
                statsFilters,
                timezone,
                undefined,
            )

            expect(result.isError).toBe(true)
        })
    })
})
