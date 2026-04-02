import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { zeroTouchTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentTicketsClosed'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentZeroTouchTicketsTrend,
    useAiAgentZeroTouchTicketsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

jest.mock('domains/reporting/models/scopes/aiAgentTicketsClosed')
const mockZeroTouchTicketsCountQueryV2Factory = assumeMock(
    zeroTouchTicketsCountQueryV2Factory,
)

const timezone = 'UTC'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}

describe('useAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call zeroTouchTicketsCountQueryV2Factory with filters for both periods', () => {
        renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(statsFilters, timezone),
        )

        expect(mockZeroTouchTicketsCountQueryV2Factory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
        })
        expect(mockZeroTouchTicketsCountQueryV2Factory).toHaveBeenCalledWith({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
        })
    })

    it('should return data from useStatsMetricTrend', () => {
        const mockTrendResult = {
            data: { value: 80, prevValue: 60 },
            isFetching: false,
            isError: false,
        }
        mockUseStatsMetricTrend.mockReturnValue(mockTrendResult)

        const { result } = renderHook(() =>
            useAiAgentZeroTouchTicketsTrend(statsFilters, timezone),
        )

        expect(result.current).toBe(mockTrendResult)
    })
})

describe('fetchAiAgentZeroTouchTicketsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call zeroTouchTicketsCountQueryV2Factory with filters for both periods', async () => {
        mockFetchStatsMetricTrend.mockResolvedValue({
            isFetching: false,
            isError: false,
        })

        await fetchAiAgentZeroTouchTicketsTrend(statsFilters, timezone)

        expect(mockZeroTouchTicketsCountQueryV2Factory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
        })
        expect(mockZeroTouchTicketsCountQueryV2Factory).toHaveBeenCalledWith({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
        })
    })

    it('should return data from fetchStatsMetricTrend', async () => {
        const mockTrendResult = {
            data: { value: 80, prevValue: 60 },
            isFetching: false,
            isError: false,
        }
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrendResult)

        const result = await fetchAiAgentZeroTouchTicketsTrend(
            statsFilters,
            timezone,
        )

        expect(result).toBe(mockTrendResult)
    })
})
