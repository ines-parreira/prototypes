import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDiscountCodesAverageValueTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'
import { useAverageDiscountAmountMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAverageDiscountAmountMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend',
)

const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseDiscountCodesAverageValueTrend = assumeMock(
    useDiscountCodesAverageValueTrend,
)

describe('useAverageDiscountAmountMetric', () => {
    const mockFilters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockUseDiscountCodesAverageValueTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 25.5, prevValue: 20.0 },
        } as any)
    })

    it('should return correct data when query succeeds', () => {
        const { result } = renderHook(() => useAverageDiscountAmountMetric())

        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toEqual({
            label: 'Average discount amount',
            value: 25.5,
            prevValue: 20.0,
        })
    })

    it('should return isFetching true when query is fetching', () => {
        mockUseDiscountCodesAverageValueTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useAverageDiscountAmountMetric())

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError true when query has an error', () => {
        mockUseDiscountCodesAverageValueTrend.mockReturnValue({
            isFetching: false,
            isError: true,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useAverageDiscountAmountMetric())

        expect(result.current.isError).toBe(true)
    })

    it('should return null values when data is not available', () => {
        mockUseDiscountCodesAverageValueTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useAverageDiscountAmountMetric())

        expect(result?.current?.data?.value).toBeNull()
        expect(result?.current?.data?.prevValue).toBeNull()
    })

    it('should return correct label in data', () => {
        const { result } = renderHook(() => useAverageDiscountAmountMetric())

        expect(result?.current?.data?.label).toBe('Average discount amount')
    })

    it('should call useDiscountCodesAverageValueTrend with filters and timezone from useStatsFilters', () => {
        renderHook(() => useAverageDiscountAmountMetric())

        expect(mockUseDiscountCodesAverageValueTrend).toHaveBeenCalledWith(
            mockFilters,
            'UTC',
        )
    })
})
