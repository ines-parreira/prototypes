import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useAIJourneyGmvInfluenced } from './useAIJourneyGmvInfluenced'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
jest.mock(
    'domains/reporting/models/queryFactories/ai-sales-agent/metrics',
    () => ({
        gmvInfluencedQueryFactory: jest
            .fn()
            .mockImplementation((filters) => filters),
    }),
)

describe('useAIJourneyGmvInfluenced', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        ;(useCurrency as jest.Mock).mockReturnValue({ currency: 'USD' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state when data is being fetched', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyGmvInfluenced(mockUserTimezone, mockFilters),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.label).toBe('Total Revenue')
        expect(result.current.currency).toBe('USD')
    })

    it('should handle undefined data', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyGmvInfluenced(mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(undefined)
    })

    it('should handle missing previous value', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: {
                value: 1000,
                prevValue: undefined,
            },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyGmvInfluenced(mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(1000)
    })

    it('should handle zero previous value', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: {
                value: 1000,
                prevValue: 0,
            },
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyGmvInfluenced(mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(1000)
    })
})
