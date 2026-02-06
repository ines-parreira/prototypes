import { renderHook } from '@repo/testing'
import moment from 'moment'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useSearchResultRange } from 'domains/reporting/pages/help-center/hooks/useSearchResultRange'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimensionV2)

describe('useSearchResultRange', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'

    it('should return empty data when no data from the cube.js', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: null,
        })

        const { result } = renderHook(() =>
            useSearchResultRange(statsFilters, timezone),
        )

        expect(result.current).toEqual({ isLoading: false, data: [] })
    })

    it('should return formatted data when cube.js return the data', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.SearchResultRange]:
                            'Articles shown',
                        [HelpCenterTrackingEventMeasures.SearchRequestedCount]:
                            '10',
                    },
                    {
                        [HelpCenterTrackingEventDimensions.SearchResultRange]:
                            'No articles shown',
                        [HelpCenterTrackingEventMeasures.SearchRequestedCount]:
                            '5',
                    },
                ],
            },
        })

        const { result } = renderHook(() =>
            useSearchResultRange(statsFilters, timezone),
        )

        expect(result.current).toEqual({
            isLoading: false,
            data: [
                { label: 'Articles shown', value: 10 },
                { label: 'No articles shown', value: 5 },
            ],
        })
    })

    it('should filter data with no label', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.SearchResultRange]:
                            'Article shown',
                        [HelpCenterTrackingEventMeasures.SearchRequestedCount]:
                            '10',
                    },
                    {
                        [HelpCenterTrackingEventDimensions.SearchResultRange]:
                            null,
                        [HelpCenterTrackingEventMeasures.SearchRequestedCount]:
                            '10',
                    },
                ],
            },
        } as any)

        const { result } = renderHook(() =>
            useSearchResultRange(statsFilters, timezone),
        )

        expect(result.current).toEqual({
            isLoading: false,
            data: [{ label: 'Article shown', value: 10 }],
        })
    })
})
