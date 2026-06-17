import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchChannelsEmailTicketStatusRows,
    useChannelsEmailTicketStatusBarData,
} from 'domains/reporting/pages/performance/channels/email/hooks/useChannelsEmailTicketStatusBarData'

jest.mock('domains/reporting/hooks/useStatsMetric', () => ({
    useStatsMetric: jest.fn(),
    fetchStatsMetric: jest.fn(),
}))

const mockUseStatsMetric = assumeMock(useStatsMetric)
const mockFetchStatsMetric = assumeMock(fetchStatsMetric)

const filters: StatsFilters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
}
const timezone = 'UTC'

const metric = (value: number | null, isFetching = false, isError = false) => ({
    isFetching,
    isError,
    data: { value },
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useChannelsEmailTicketStatusBarData', () => {
    it('returns one bar per ticket status in created/open/closed order', () => {
        mockUseStatsMetric
            .mockReturnValueOnce(metric(120))
            .mockReturnValueOnce(metric(30))
            .mockReturnValueOnce(metric(90))

        const { result } = renderHook(() =>
            useChannelsEmailTicketStatusBarData(filters, timezone),
        )

        expect(result.current.data).toEqual([
            { name: 'Created', value: 120 },
            { name: 'Open', value: 30 },
            { name: 'Closed', value: 90 },
        ])
        expect(result.current.isLoading).toBe(false)
    })

    it('reads the email-scoped created, open and closed value metrics', () => {
        mockUseStatsMetric.mockReturnValue(metric(0))

        renderHook(() => useChannelsEmailTicketStatusBarData(filters, timezone))

        expect(
            mockUseStatsMetric.mock.calls.map((call) => call[0].metricName),
        ).toEqual([
            'performance-channels-email-created-tickets-value',
            'performance-channels-email-open-tickets-value',
            'performance-channels-email-closed-tickets-value',
        ])
    })

    it('maps a missing metric value to null', () => {
        mockUseStatsMetric
            .mockReturnValueOnce(metric(120))
            .mockReturnValueOnce(metric(null))
            .mockReturnValueOnce(metric(90))

        const { result } = renderHook(() =>
            useChannelsEmailTicketStatusBarData(filters, timezone),
        )

        expect(result.current.data[1]).toEqual({
            name: 'Open',
            value: null,
        })
    })

    it('is loading while any of the three metrics is fetching', () => {
        mockUseStatsMetric
            .mockReturnValueOnce(metric(120))
            .mockReturnValueOnce(metric(null, true))
            .mockReturnValueOnce(metric(90))

        const { result } = renderHook(() =>
            useChannelsEmailTicketStatusBarData(filters, timezone),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('surfaces an error when any of the three metrics fails', () => {
        mockUseStatsMetric
            .mockReturnValueOnce(metric(120))
            .mockReturnValueOnce(metric(null, false, true))
            .mockReturnValueOnce(metric(90))

        const { result } = renderHook(() =>
            useChannelsEmailTicketStatusBarData(filters, timezone),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchChannelsEmailTicketStatusRows', () => {
    it('returns one row per ticket status in created/open/closed order', async () => {
        mockFetchStatsMetric
            .mockResolvedValueOnce(metric(120))
            .mockResolvedValueOnce(metric(30))
            .mockResolvedValueOnce(metric(90))

        const rows = await fetchChannelsEmailTicketStatusRows(filters, timezone)

        expect(rows).toEqual([
            { name: 'Created', value: 120 },
            { name: 'Open', value: 30 },
            { name: 'Closed', value: 90 },
        ])
    })

    it('reads the email-scoped created, open and closed value metrics', async () => {
        mockFetchStatsMetric.mockResolvedValue(metric(0))

        await fetchChannelsEmailTicketStatusRows(filters, timezone)

        expect(
            mockFetchStatsMetric.mock.calls.map((call) => call[0].metricName),
        ).toEqual([
            'performance-channels-email-created-tickets-value',
            'performance-channels-email-open-tickets-value',
            'performance-channels-email-closed-tickets-value',
        ])
    })

    it('maps a missing metric value to null', async () => {
        mockFetchStatsMetric
            .mockResolvedValueOnce(metric(120))
            .mockResolvedValueOnce(metric(null))
            .mockResolvedValueOnce(metric(90))

        const rows = await fetchChannelsEmailTicketStatusRows(filters, timezone)

        expect(rows[1]).toEqual({ name: 'Open', value: null })
    })
})
