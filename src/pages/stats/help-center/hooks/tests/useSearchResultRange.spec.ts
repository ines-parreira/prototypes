import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'models/stat/types'
import { useSearchResultRange } from 'pages/stats/help-center/hooks/useSearchResultRange'
import { formatReportingQueryDate } from 'utils/reporting'

jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)

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
        })

        const { result } = renderHook(() =>
            useSearchResultRange(statsFilters, timezone),
        )

        expect(result.current).toEqual({
            isLoading: false,
            data: [{ label: 'Article shown', value: 10 }],
        })
    })
})
