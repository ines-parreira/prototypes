import { renderHook } from '@repo/testing'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { useNoSearchResultsMetrics } from 'domains/reporting/pages/help-center/hooks/useNoSearchResultsMetrics'

jest.mock('domains/reporting/hooks/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimensionV2: jest.fn(),
}))

const mockUseMetric = jest.mocked(useMetric)
const mockUseMetricPerDimension = jest.mocked(useMetricPerDimensionV2)

const statsFilters = {
    period: {
        start_datetime: '2020-01-16T03:04:56.789-10:00',
        end_datetime: '2020-01-02T03:04:56.789-10:00',
    },
}
const timezone = 'UTC'
const itemPerPage = 10
const currentPage = 1

describe('useNoSearchResultsMetrics', () => {
    beforeEach(() => {
        mockUseMetric.mockReturnValue({ isFetching: false, isError: false })
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [],
                decile: null,
            },
        })
    })

    it('should call metric hook with correct params', () => {
        renderHook(() =>
            useNoSearchResultsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
            }),
        )

        const expectedQueryV1 = {
            metricName: METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT,
            dimensions: [],
            filters: [
                {
                    member: HelpCenterTrackingEventMember.PeriodStart,
                    operator: 'afterDate',
                    values: ['2020-01-16T03:04:56.789'],
                },
                {
                    member: HelpCenterTrackingEventMember.PeriodEnd,
                    operator: 'beforeDate',
                    values: ['2020-01-02T03:04:56.789'],
                },
            ],
            measures: [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            segments: [HelpCenterTrackingEventSegment.NoSearchResultOnly],
            timezone: timezone,
        }
        const expectedQueryV2 = {
            metricName: METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT,
            scope: MetricScope.Helpcenter,
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2020-01-16T03:04:56.789'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2020-01-02T03:04:56.789'],
                },
                {
                    member: 'helpCenterEventType',
                    operator: 'one-of',
                    values: ['search.requested'],
                },
                {
                    member: 'searchResultCount',
                    operator: 'one-of',
                    values: [0],
                },
            ],
            measures: ['uniqueSearchQueryCount'],
            timezone: timezone,
        }
        expect(mockUseMetric).toHaveBeenCalledWith(
            expectedQueryV1,
            expectedQueryV2,
        )
    })

    it('should return total', () => {
        mockUseMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 10 },
        })
        const { result } = renderHook(() =>
            useNoSearchResultsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
            }),
        )

        expect(result.current).toEqual({
            total: 10,
            isLoading: false,
            data: [],
        })
    })

    it('should return formatted data', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount]:
                            '10',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '5',
                        [HelpCenterTrackingEventDimensions.SearchQuery]:
                            'report issue',
                    },
                ],
                decile: null,
            },
        })
        const { result } = renderHook(() =>
            useNoSearchResultsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
            }),
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        type: 'string',
                        value: 'report issue',
                    },
                    {
                        type: 'number',
                        value: 10,
                    },
                ],
            ],
        })
    })

    it('should return null for each field when data is empty', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [{}],
                decile: null,
            },
        })
        const { result } = renderHook(() =>
            useNoSearchResultsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
            }),
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        type: 'string',
                        value: null,
                    },
                    {
                        type: 'number',
                        value: null,
                    },
                ],
            ],
        })
    })

    it('should return an empty array when no data from api', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: null,
        })
        const { result } = renderHook(() =>
            useNoSearchResultsMetrics({
                statsFilters,
                timezone,
                itemPerPage,
                currentPage,
            }),
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [],
        })
    })
})
