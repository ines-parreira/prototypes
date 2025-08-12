import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ConvertTrackingEventsMeasure } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useClickThroughRate } from './useClickThroughRate'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')
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
        ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === ConvertTrackingEventsMeasure.UniqClicks) {
                return {
                    data: { value: 1, prevValue: 0 },
                    isFetching: false,
                }
            }

            if (measures === AiSalesAgentConversationsMeasure.Count) {
                return {
                    data: { value: 100, prevValue: 10 },
                    isFetching: false,
                }
            }
        })
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === ConvertTrackingEventsMeasure.UniqClicks) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 1,
                                label: ConvertTrackingEventsMeasure.UniqClicks,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 0,
                                label: ConvertTrackingEventsMeasure.UniqClicks,
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
                                value: 100,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 100,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                        ],
                    ] satisfies TimeSeriesDataItem[][],
                    isFetching: false,
                }
            }
        })

        const userTimezone = 'America/New_York'

        const { result } = renderHook(() =>
            useClickThroughRate(
                '123',
                userTimezone,
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            label: 'Click Through Rate',
            value: 1,
            currency: 'USD',
            isLoading: false,
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            prevValue: 0,
            series: [
                {
                    dateTime: '2025-07-03',
                    value: 1,
                },
                {
                    dateTime: '2025-07-10',
                    value: 0,
                },
            ],
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useClickThroughRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            currency: 'USD',
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Click Through Rate',
            metricFormat: 'percent',
            prevValue: 0,
            value: 0,
            series: [],
        })
    })

    it('should correctly use the currency from useCurrency hook', () => {
        ;(useMetricTrend as jest.Mock).mockReturnValue({
            data: { value: 100, prevValue: 50 },
            isFetching: false,
        })
        ;(useTimeSeries as jest.Mock).mockReturnValue({
            data: [],
            isFetching: false,
        })
        ;(useCurrency as jest.Mock).mockReturnValue({
            currency: 'EUR',
        })

        const { result } = renderHook(() =>
            useClickThroughRate(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current.currency).toBe('EUR')
    })
})
