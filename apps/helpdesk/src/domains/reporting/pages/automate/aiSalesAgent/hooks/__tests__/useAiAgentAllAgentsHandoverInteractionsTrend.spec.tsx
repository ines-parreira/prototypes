import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentHandoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentAllAgentsHandoverInteractionsTrend,
    useAiAgentAllAgentsHandoverInteractionsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentAllAgentsHandoverInteractionsTrend'

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: moment()
            .add(1 * 7, 'day')
            .format('YYYY-MM-DDT00:00:00.000'),
        end_datetime: moment()
            .add(3 * 7, 'day')
            .format('YYYY-MM-DDT23:50:59.999'),
    },
}

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

jest.mock('domains/reporting/models/scopes/handoverInteractions')
const mockAiAgentHandoverInteractionsV2QueryFactory = assumeMock(
    aiAgentHandoverInteractionsV2QueryFactory,
)

describe('aiAgentAllAgentsHandoverInteractionsTrend', () => {
    const currentQuery = {
        metricName: 'ai-agent-handover-interactions',
        current: true,
    } as any
    const prevQuery = {
        metricName: 'ai-agent-handover-interactions',
        current: false,
    } as any

    beforeEach(() => {
        mockAiAgentHandoverInteractionsV2QueryFactory
            .mockReturnValueOnce(currentQuery)
            .mockReturnValueOnce(prevQuery)
    })

    describe('useAiAgentAllAgentsHandoverInteractionsTrend', () => {
        it('should return data from useStatsMetricTrend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAllAgentsHandoverInteractionsTrend(
                    statsFilters,
                    timezone,
                ),
            )

            expect(result.current).toEqual({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: false,
                isError: false,
            })

            renderHook(() =>
                useAiAgentAllAgentsHandoverInteractionsTrend(
                    statsFilters,
                    timezone,
                ),
            )

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                currentQuery,
                prevQuery,
            )
        })

        it('should forward isFetching and isError state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentAllAgentsHandoverInteractionsTrend(
                    statsFilters,
                    timezone,
                ),
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
                useAiAgentAllAgentsHandoverInteractionsTrend(
                    statsFilters,
                    timezone,
                ),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAiAgentAllAgentsHandoverInteractionsTrend', () => {
        beforeEach(() => {
            mockAiAgentHandoverInteractionsV2QueryFactory
                .mockReturnValueOnce(currentQuery)
                .mockReturnValueOnce(prevQuery)
        })

        it('should return data from fetchStatsMetricTrend', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchAiAgentAllAgentsHandoverInteractionsTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: undefined as any,
                isFetching: false,
                isError: false,
            })

            await fetchAiAgentAllAgentsHandoverInteractionsTrend(
                statsFilters,
                timezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                currentQuery,
                prevQuery,
            )
        })
    })
})
