import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { handoverInteractionsV2QueryFactory } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchHandoverInteractionsTrend,
    useHandoverInteractionsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useHandoverInteractionsTrend'

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
const mockHandoverInteractionsV2QueryFactory = assumeMock(
    handoverInteractionsV2QueryFactory,
)

describe('allHandoverInteractionsTrend', () => {
    const currentQuery = {
        metricName: 'handover-interactions',
        current: true,
    } as any
    const prevQuery = {
        metricName: 'handover-interactions',
        current: false,
    } as any

    beforeEach(() => {
        mockHandoverInteractionsV2QueryFactory
            .mockReturnValueOnce(currentQuery)
            .mockReturnValueOnce(prevQuery)
    })

    describe('useAllHandoverInteractionsTrend', () => {
        it('should return data from useStatsMetricTrend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useHandoverInteractionsTrend(statsFilters, timezone),
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
                useHandoverInteractionsTrend(statsFilters, timezone),
            )

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                currentQuery,
                prevQuery,
            )
        })

        it('should forward isFetching state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useHandoverInteractionsTrend(statsFilters, timezone),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should forward isError state', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined as any,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useHandoverInteractionsTrend(statsFilters, timezone),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchAllHandoverInteractionsTrend', () => {
        beforeEach(() => {
            mockHandoverInteractionsV2QueryFactory
                .mockReturnValueOnce(currentQuery)
                .mockReturnValueOnce(prevQuery)
        })

        it('should return data from fetchStatsMetricTrend', async () => {
            mockFetchStatsMetricTrend.mockResolvedValue({
                data: { value: 50, prevValue: 40 },
                isFetching: false,
                isError: false,
            })

            const result = await fetchHandoverInteractionsTrend(
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

            await fetchHandoverInteractionsTrend(statsFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                currentQuery,
                prevQuery,
            )
        })
    })
})
