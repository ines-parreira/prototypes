import { renderHook } from '@repo/testing'

import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { useFirstStoreWithAiSalesData } from 'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

const mockUseStatsFilters = jest.requireMock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
).useStatsFilters

const mockUseMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useMetricPerDimension',
).useMetricPerDimensionV2

describe('useFirstStoreWithAiSalesData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2021-01-01T00:00:00Z',
                    end_datetime: '2021-01-02T00:00:00Z',
                },
            },
            userTimezone: 'UTC',
        })
    })

    it('returns storeId as number when data is available', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: {
                allData: [
                    {
                        [AiSalesAgentConversationsDimension.StoreIntegrationId]:
                            '123',
                    },
                ],
            },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useFirstStoreWithAiSalesData({ enabled: true }),
        )

        expect(result.current.storeId).toBe(123)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns null storeId when no data is available', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useFirstStoreWithAiSalesData({ enabled: true }),
        )

        expect(result.current.storeId).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('returns isLoading=true when fetching', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useFirstStoreWithAiSalesData({ enabled: true }),
        )

        expect(result.current.storeId).toBeNull()
        expect(result.current.isLoading).toBe(true)
    })

    it('returns null and isLoading false when disabled', () => {
        mockUseMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useFirstStoreWithAiSalesData({ enabled: false }),
        )

        expect(result.current.storeId).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })
})
