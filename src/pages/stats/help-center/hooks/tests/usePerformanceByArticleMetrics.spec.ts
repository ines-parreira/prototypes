import {renderHook} from '@testing-library/react-hooks'
import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {usePerformanceByArticleMetrics} from '../usePerformanceByArticleMetrics'

jest.mock('hooks/reporting/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))

const mockUseMetric = jest.mocked(useMetric)
const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)

const statsFilters = {
    period: {
        start_datetime: '2020-01-16T03:04:56.789-10:00',
        end_datetime: '2020-01-02T03:04:56.789-10:00',
    },
}
const timezone = 'UTC'
const helpCenterDomain = 'acme'
const itemPerPage = 10
const currentPage = 1

describe('usePerformanceByArticleMetrics', () => {
    beforeEach(() => {
        mockUseMetric.mockReturnValue({isFetching: false, isError: false})
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
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
            })
        )

        expect(mockUseMetric).toHaveBeenCalledWith({
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
            measures: [HelpCenterTrackingEventMeasures.ArticleCount],
            segments: [HelpCenterTrackingEventSegment.ArticleViewOnly],
            timezone: timezone,
        })
    })

    it('should return total', () => {
        mockUseMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 10},
        })
        const {result} = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
            })
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
                        [HelpCenterTrackingEventDimensions.ArticleTitle]:
                            'Set up Voice (Phone)',
                        [HelpCenterTrackingEventDimensions.ArticleLastUpdated]:
                            '1970-01-19T20:48:32.000',
                        [HelpCenterTrackingEventDimensions.ArticleSlug]:
                            'set-up-voice-(phone)',
                        [HelpCenterTrackingEventDimensions.ArticleId]: '1',
                        [HelpCenterTrackingEventDimensions.LocaleCode]: 'en-US',
                        [HelpCenterTrackingEventMeasures.ArticleView]: '1',
                    },
                ],
                decile: null,
            },
        })
        const {result} = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
            })
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        link: `http://${helpCenterDomain}/en-US/set-up-voice-(phone)-1`,
                        type: 'string',
                        value: 'Set up Voice (Phone)',
                    },
                    {
                        type: 'number',
                        value: 1,
                    },
                    {
                        type: 'percent',
                        value: null,
                    },
                    {
                        type: 'string',
                        value: null,
                    },
                    {
                        type: 'date',
                        value: '1970-01-19T20:48:32.000',
                    },
                ],
            ],
        })
    })

    it('should return null when data is empty', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [{}],
                decile: null,
            },
        })
        const {result} = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
            })
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [
                [
                    {
                        link: null,
                        type: 'string',
                        value: null,
                    },
                    {
                        type: 'number',
                        value: null,
                    },
                    {
                        type: 'percent',
                        value: null,
                    },
                    {
                        type: 'string',
                        value: null,
                    },
                    {
                        type: 'date',
                        value: null,
                    },
                ],
            ],
        })
    })
})
