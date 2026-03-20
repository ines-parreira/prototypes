import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useAIJourneyConversionRate } from './useAIJourneyConversionRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

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
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: { value: 20, prevValue: 10 },
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentConversationsMeasure.Count) {
                return {
                    data: { value: 50, prevValue: 50 },
                    isFetching: false,
                }
            }
        })
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentOrdersMeasure.Count) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 10,
                                label: AiSalesAgentOrdersMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 20,
                                label: AiSalesAgentOrdersMeasure.Count,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentConversationsMeasure.Count) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 50,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 50,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(40)
        expect(result.current.prevValue).toBe(20)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.label).toBe('Conversion rate')
        expect(result.current.series).toEqual([
            {
                dateTime: '2025-07-03',
                label: 'AiSalesAgentOrders.count',
                value: 20,
            },
            {
                dateTime: '2025-07-10',
                label: 'AiSalesAgentOrders.count',
                value: 40,
            },
        ])
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
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
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
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
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
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
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
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
            }),
        )

        expect(result.current.value).toBe(100)
    })

    it('should disable queries and return zeroed values when no flows or campaigns are selected', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyConversionRate({
                integrationId: '123',
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                granularity: ReportingGranularity.Week,
                forceEmpty: true,
            }),
        )

        const metricTrendCalls = (useMetricTrend as jest.Mock).mock.calls
        metricTrendCalls.forEach((call) => {
            expect(call[4]).toBe(false)
        })
        const timeSeriesCalls = (useTimeSeries as jest.Mock).mock.calls
        timeSeriesCalls.forEach((call) => {
            expect(call[2]).toBe(false)
        })

        expect(result.current.value).toBe(0)
        expect(result.current.prevValue).toBe(0)
        expect(result.current.series).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })
})
