import { renderHook } from '@testing-library/react-hooks'

import { AiSalesAgentConversationsDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'

import { useFirstStoreWithAiSalesData } from '../useFirstStoreWithAiSalesData'

jest.mock('hooks/reporting/support-performance/useStatsFilters', () => ({
    useStatsFilters: jest.fn(),
}))

jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseStatsFilters = jest.requireMock(
    'hooks/reporting/support-performance/useStatsFilters',
).useStatsFilters

const mockUseMetricPerDimension = jest.requireMock(
    'hooks/reporting/useMetricPerDimension',
).useMetricPerDimension

describe('useFirstStoreWithAiSalesData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({ userTimezone: 'UTC' })
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
