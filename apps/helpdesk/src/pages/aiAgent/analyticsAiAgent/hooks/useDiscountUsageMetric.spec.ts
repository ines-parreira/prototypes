import { assumeMock, renderHook } from '@repo/testing'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDiscountCodesRateAppliedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend'
import { useDiscountUsageMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useDiscountUsageMetric'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend',
)

const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseDiscountCodesRateAppliedTrend = assumeMock(
    useDiscountCodesRateAppliedTrend,
)

describe('useDiscountUsageMetric', () => {
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

        mockUseDiscountCodesRateAppliedTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0.75, prevValue: 0.6 },
        } as any)
    })

    it('should return correct data when query succeeds', () => {
        const { result } = renderHook(() => useDiscountUsageMetric())

        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.data).toEqual({
            label: 'Discount usage',
            value: 0.75,
            prevValue: 0.6,
        })
    })

    it('should return isFetching true when query is fetching', () => {
        mockUseDiscountCodesRateAppliedTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useDiscountUsageMetric())

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError true when query has an error', () => {
        mockUseDiscountCodesRateAppliedTrend.mockReturnValue({
            isFetching: false,
            isError: true,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useDiscountUsageMetric())

        expect(result.current.isError).toBe(true)
    })

    it('should return null values when data is not available', () => {
        mockUseDiscountCodesRateAppliedTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as any)

        const { result } = renderHook(() => useDiscountUsageMetric())

        expect(result?.current?.data?.value).toBeNull()
        expect(result?.current?.data?.prevValue).toBeNull()
    })

    it('should return correct label in data', () => {
        const { result } = renderHook(() => useDiscountUsageMetric())

        expect(result?.current?.data?.label).toBe('Discount usage')
    })

    it('should call useDiscountCodesRateAppliedTrend with filters and timezone from useStatsFilters', () => {
        renderHook(() => useDiscountUsageMetric())

        expect(mockUseDiscountCodesRateAppliedTrend).toHaveBeenCalledWith(
            mockFilters,
            'UTC',
        )
    })
})
