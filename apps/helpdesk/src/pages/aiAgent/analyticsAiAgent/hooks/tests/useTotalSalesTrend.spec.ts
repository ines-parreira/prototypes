import { assumeMock, renderHook } from '@repo/testing'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { AiSalesAgentTotalSalesAmountQueryFactoryV2 } from 'domains/reporting/models/scopes/AiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchTotalSalesTrend,
    useTotalSalesTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesTrend'

jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/AiSalesAgentOrdersPerformance')

const queryFactoryMock = assumeMock(AiSalesAgentTotalSalesAmountQueryFactoryV2)

const filters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'
const mockQuery = { measures: ['totalSalesAmount'], filters: [] } as any

describe('useTotalSalesTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryFactoryMock.mockReturnValue(mockQuery)
    })

    it('calls AiSalesAgentTotalSalesAmountQueryFactoryV2 with current period filters', () => {
        renderHook(() => useTotalSalesTrend(filters, timezone))

        expect(queryFactoryMock).toHaveBeenCalledWith({ filters, timezone })
    })

    it('calls AiSalesAgentTotalSalesAmountQueryFactoryV2 with previous period filters', () => {
        renderHook(() => useTotalSalesTrend(filters, timezone))

        expect(queryFactoryMock).toHaveBeenCalledWith({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        })
    })

    it('passes both queries to useStatsMetricTrend', () => {
        renderHook(() => useTotalSalesTrend(filters, timezone))

        expect(useStatsMetricTrend as jest.Mock).toHaveBeenCalledWith(
            mockQuery,
            mockQuery,
        )
    })

    it('returns the result from useStatsMetricTrend', () => {
        const mockResult = {
            data: { value: 5000, prevValue: 4000 },
            isFetching: false,
            isError: false,
        }
        ;(useStatsMetricTrend as jest.Mock).mockReturnValue(mockResult)

        const { result } = renderHook(() =>
            useTotalSalesTrend(filters, timezone),
        )

        expect(result.current).toBe(mockResult)
    })
})

describe('fetchTotalSalesTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryFactoryMock.mockReturnValue(mockQuery)
    })

    it('calls AiSalesAgentTotalSalesAmountQueryFactoryV2 with current period filters', async () => {
        ;(fetchStatsMetricTrend as jest.Mock).mockResolvedValue({})

        await fetchTotalSalesTrend(filters, timezone)

        expect(queryFactoryMock).toHaveBeenCalledWith({ filters, timezone })
    })

    it('calls AiSalesAgentTotalSalesAmountQueryFactoryV2 with previous period filters', async () => {
        ;(fetchStatsMetricTrend as jest.Mock).mockResolvedValue({})

        await fetchTotalSalesTrend(filters, timezone)

        expect(queryFactoryMock).toHaveBeenCalledWith({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        })
    })

    it('passes both queries to fetchStatsMetricTrend', async () => {
        ;(fetchStatsMetricTrend as jest.Mock).mockResolvedValue({})

        await fetchTotalSalesTrend(filters, timezone)

        expect(fetchStatsMetricTrend as jest.Mock).toHaveBeenCalledWith(
            mockQuery,
            mockQuery,
        )
    })

    it('returns the result from fetchStatsMetricTrend', async () => {
        const mockResult = { fileName: 'total-sales.csv', files: {} }
        ;(fetchStatsMetricTrend as jest.Mock).mockResolvedValue(mockResult)

        const result = await fetchTotalSalesTrend(filters, timezone)

        expect(result).toBe(mockResult)
    })
})
