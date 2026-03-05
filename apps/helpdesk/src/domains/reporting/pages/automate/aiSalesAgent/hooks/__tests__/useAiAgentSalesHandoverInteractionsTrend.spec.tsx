import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiSalesAgentHandoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAiAgentSalesHandoverInteractionsTrend,
    useAiAgentSalesHandoverInteractionsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentSalesHandoverInteractionsTrend'

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
assumeMock(aiSalesAgentHandoverInteractionsV2QueryFactory)

describe('aiAgentSalesHandoverInteractionsTrend', () => {
    describe('useAiAgentSalesHandoverInteractionsTrend', () => {
        it('should return data from useStatsMetricTrend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentSalesHandoverInteractionsTrend(
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

        it('should forward isFetching state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useAiAgentSalesHandoverInteractionsTrend(
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
                useAiAgentSalesHandoverInteractionsTrend(
                    statsFilters,
                    timezone,
                ),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAiAgentSalesHandoverInteractionsTrend', () => {
        it('should return data from fetchStatsMetricTrend', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchAiAgentSalesHandoverInteractionsTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual({
                data: { value: 50, prevValue: 40 },
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

            const result = await fetchAiAgentSalesHandoverInteractionsTrend(
                statsFilters,
                timezone,
            )

            expect(result.isError).toBe(true)
        })
    })
})
