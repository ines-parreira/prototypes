import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'

import { useAIJourneyConversionRate } from './useAIJourneyConversionRate'

jest.mock('domains/reporting/hooks/useMetricTrend')

describe('useAIJourneyConversionRate', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should calculate conversion rate correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((currentQuery) => {
            if (currentQuery.queryType === 'order') {
                return {
                    data: { value: 20, prevValue: 10 },
                    isFetching: false,
                }
            }
            return {
                data: { value: 100, prevValue: 100 },
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate('123', mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(100)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.label).toBe('Conversion rate')
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((currentQuery) => {
            if (currentQuery.queryType === 'order') {
                return {
                    data: null,
                    isFetching: true,
                }
            }
            return {
                data: null,
                isFetching: true,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate('123', mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return 0 when totalContactsEnrolled value is 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((currentQuery) => {
            if (currentQuery.queryType === 'order') {
                return {
                    data: { value: 20, prevValue: 10 },
                    isFetching: false,
                }
            }
            return {
                data: { value: 0, prevValue: 0 },
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate('123', mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle missing data correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => {
            return {
                data: null,
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate('123', mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle edge case of previous value being 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((currentQuery) => {
            if (currentQuery.queryType === 'order') {
                return {
                    data: { value: 20, prevValue: 0 },
                    isFetching: false,
                }
            }
            return {
                data: { value: 100, prevValue: 100 },
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate('123', mockUserTimezone, mockFilters),
        )

        expect(result.current.value).toBe(100)
    })
})
