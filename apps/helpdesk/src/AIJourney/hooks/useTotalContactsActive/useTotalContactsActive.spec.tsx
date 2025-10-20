import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useTotalContactsActive } from './useTotalContactsActive'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useTotalContactsActive', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    it('should return correct data when values are available', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: { value: 75, prevValue: 40 },
            isFetching: false,
        }))
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentConversationsMeasure.Count) {
                return {
                    data: [
                        [
                            {
                                dateTime: '2025-07-03',
                                value: 8,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 12,
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
            useTotalContactsActive(
                '123',
                userTimezone,
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: false,
            label: 'Total Active Contacts',
            metricFormat: 'decimal-precision-1',
            prevValue: 40,
            value: 75,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: 'AiSalesAgentConversations.count',
                    value: 8,
                },
                {
                    dateTime: '2025-07-10',
                    label: 'AiSalesAgentConversations.count',
                    value: 12,
                },
            ],
        })
    })

    it('should handle loading state correctly', () => {
        ;(useMetricTrend as jest.Mock).mockImplementation(() => ({
            data: undefined,
            isFetching: true,
        }))
        ;(useTimeSeries as jest.Mock).mockImplementation((args) => {
            const measures = args.measures[0]
            if (measures === AiSalesAgentConversationsMeasure.Count) {
                return {
                    data: undefined,
                    isFetching: true,
                }
            }
        })

        const { result } = renderHook(() =>
            useTotalContactsActive(
                '123',
                'UTC',
                mockFilters,
                ReportingGranularity.Week,
                'shopName',
            ),
        )

        expect(result.current).toEqual({
            interpretAs: 'more-is-better',
            isLoading: true,
            label: 'Total Active Contacts',
            metricFormat: 'decimal-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
        })
    })
})
