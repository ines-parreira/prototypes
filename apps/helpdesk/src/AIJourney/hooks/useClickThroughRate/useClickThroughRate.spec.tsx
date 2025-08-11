import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useClickThroughRate } from './useClickThroughRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')

describe('useClickThroughRate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'USD',
        })
    })

    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useClickThroughRate('123', userTimezone, mockFilters, 'shopName'),
        )

        expect(result.current).toEqual({
            label: 'Click Through Rate',
            value: 100,
            currency: 'USD',
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            prevValue: 100,
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useClickThroughRate('123', 'UTC', mockFilters, 'shopName'),
        )

        expect(result.current).toEqual({
            currency: 'USD',
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Click Through Rate',
            metricFormat: 'percent',
            prevValue: 0,
            value: 0,
        })
    })

    it('should correctly use the currency from useCurrency hook', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        })
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'EUR',
        })

        const { result } = renderHook(() =>
            useClickThroughRate('123', 'UTC', mockFilters, 'shopName'),
        )

        expect(result.current.currency).toBe('EUR')
    })
})
