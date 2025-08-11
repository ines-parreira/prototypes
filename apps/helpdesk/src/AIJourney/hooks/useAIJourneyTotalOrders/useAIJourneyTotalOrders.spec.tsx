import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberOfOrderQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'

import { useAIJourneyTotalOrders } from './useAIJourneyTotalOrders'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/models/queryFactories/ai-sales-agent/metrics')

describe('useAIJourneyTotalOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(totalNumberOfOrderQueryFactory as jest.Mock).mockReturnValue(
            'mocked-query',
        )
    })

    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        }))

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useAIJourneyTotalOrders('123', userTimezone, mockFilters),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: false,
            label: 'Total Orders',
            metricFormat: 'decimal-precision-1',
            prevValue: 50,
            value: 100,
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: undefined,
            isFetching: true,
        }))

        const { result } = renderHook(() =>
            useAIJourneyTotalOrders('123', 'UTC', mockFilters),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Total Orders',
            metricFormat: 'decimal-precision-1',
            prevValue: 0,
            value: 0,
        })
    })
})
