import { renderHook } from '@testing-library/react'

import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { useTotalContactsCompleteJourney } from './useTotalContactsCompleteJourney'

jest.mock('domains/reporting/hooks/useMetricTrend')
jest.mock('domains/reporting/hooks/useTimeSeries')

describe('useTotalContactsCompleteJourney', () => {
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
            data: { value: 100, prevValue: 50 },
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
                                value: 10,
                                label: AiSalesAgentConversationsMeasure.Count,
                            },
                            {
                                dateTime: '2025-07-10',
                                value: 15,
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
            useTotalContactsCompleteJourney(
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
            label: 'Total Contacts Complete Journey',
            metricFormat: 'decimal-precision-1',
            prevValue: 50,
            value: 100,
            series: [
                {
                    dateTime: '2025-07-03',
                    label: 'AiSalesAgentConversations.count',
                    value: 10,
                },
                {
                    dateTime: '2025-07-10',
                    label: 'AiSalesAgentConversations.count',
                    value: 15,
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
                    data: [[]],
                    isFetching: true,
                }
            }
        })

        const { result } = renderHook(() =>
            useTotalContactsCompleteJourney(
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
            label: 'Total Contacts Complete Journey',
            metricFormat: 'decimal-precision-1',
            prevValue: 0,
            value: 0,
            series: [],
        })
    })
})
