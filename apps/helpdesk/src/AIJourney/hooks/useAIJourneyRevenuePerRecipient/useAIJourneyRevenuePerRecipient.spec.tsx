import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'

import { useAIJourneyRevenuePerRecipient } from './useAIJourneyRevenuePerRecipient'

jest.mock('domains/reporting/hooks/useMetricTrend')

describe('useAIJourneyRevenuePerRecipient', () => {
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }
    const mockJourneyIds = ['journey1', 'journey2']

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should calculate revenue per recipient correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const metricName = args.metricName
            if (metricName === 'ai-journey-gmv-influenced') {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (
                metricName === 'ai-journey-total-number-of-sales-conversations'
            ) {
                return {
                    data: { value: 50, prevValue: 25 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyRevenuePerRecipient(
                '123',
                mockUserTimezone,
                mockFilters,
                mockJourneyIds,
            ),
        )

        expect(result.current.value).toBe(20)
        expect(result.current.prevValue).toBe(20)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.label).toBe('Revenue per recipient')
        expect(result.current.metricFormat).toBe('currency')
        expect(result.current.interpretAs).toBe('more-is-better')
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: null,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyRevenuePerRecipient(
                '123',
                mockUserTimezone,
                mockFilters,
                mockJourneyIds,
            ),
        )

        expect(result.current.value).toBe(0)
        expect(result.current.isLoading).toBe(true)
    })

    it('should return 0 when totalContactsEnrolled value is 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const metricName = args.metricName
            if (metricName === 'ai-journey-gmv-influenced') {
                return {
                    data: { value: 1000, prevValue: 500 },
                    isFetching: false,
                }
            }

            if (
                metricName === 'ai-journey-total-number-of-sales-conversations'
            ) {
                return {
                    data: { value: 0, prevValue: 0 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyRevenuePerRecipient(
                '123',
                mockUserTimezone,
                mockFilters,
                mockJourneyIds,
            ),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle missing data correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyRevenuePerRecipient(
                '123',
                mockUserTimezone,
                mockFilters,
                mockJourneyIds,
            ),
        )

        expect(result.current.value).toBe(0)
    })

    it('should handle edge case of previous value being 0', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const metricName = args.metricName
            if (metricName === 'ai-journey-gmv-influenced') {
                return {
                    data: { value: 2000, prevValue: 0 },
                    isFetching: false,
                }
            }

            if (
                metricName === 'ai-journey-total-number-of-sales-conversations'
            ) {
                return {
                    data: { value: 100, prevValue: 100 },
                    isFetching: false,
                }
            }

            return {
                data: null,
                isFetching: false,
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyRevenuePerRecipient(
                '123',
                mockUserTimezone,
                mockFilters,
                mockJourneyIds,
            ),
        )

        expect(result.current.value).toBe(20)
        expect(result.current.prevValue).toBe(0)
    })
})
