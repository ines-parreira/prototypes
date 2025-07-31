import { renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { usePerformanceByArticleMetrics } from 'domains/reporting/pages/help-center/hooks/usePerformanceByArticleMetrics'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { Components } from 'rest_api/help_center_api/client.generated'

jest.mock('domains/reporting/hooks/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))
jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticleList: jest.fn(),
}))

const mockUseMetric = jest.mocked(useMetric)
const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)
const mockUseGetHelpCenterArticleList = jest.mocked(useGetHelpCenterArticleList)

const statsFilters = {
    period: {
        start_datetime: '2020-01-16T03:04:56.789-10:00',
        end_datetime: '2020-01-02T03:04:56.789-10:00',
    },
}
const timezone = 'UTC'
const helpCenterDomain = 'acme'
const helpCenterId = 1
const itemPerPage = 10
const currentPage = 1

describe('usePerformanceByArticleMetrics', () => {
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
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
            isLoading: false,
        } as unknown as UseQueryResult<null>)
    })

    it('should call metric hook with correct params', () => {
        renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
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
            data: { value: 10 },
        })
        const { result } = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
        )

        expect(result.current).toEqual({
            total: 10,
            isLoading: false,
            data: [],
        })
    })

    it('should return formatted data', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    {
                        id: 1,
                        name: 'Set up Voice (Phone)',
                        rating: { up: 3, down: 1 },
                        updated_datetime: '1970-01-19T20:48:32.000',
                    },
                ],
            },
            isLoading: false,
        } as unknown as UseQueryResult<Components.Schemas.ArticlesListPageDto>)
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.ArticleTitle]:
                            'Set up Voice (Phone)',
                        [HelpCenterTrackingEventDimensions.ArticleSlug]:
                            'set-up-voice-(phone)-1',
                        [HelpCenterTrackingEventDimensions.ArticleId]: '1',
                        [HelpCenterTrackingEventDimensions.LocaleCode]: 'en-US',
                        [HelpCenterTrackingEventMeasures.ArticleView]: '1',
                    },
                ],
                decile: null,
            },
        })
        const { result } = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
        )

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            1,
            { ids: [1], version_status: 'latest_draft' },
            { enabled: true },
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
                        value: 75,
                    },
                    {
                        type: 'string',
                        value: '3 | 1',
                    },
                    {
                        type: 'date',
                        value: '1970-01-19T20:48:32.000',
                    },
                ],
            ],
        })
    })

    it('should return formatted data when rating rate is not valid', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    {
                        id: 1,
                        name: 'Set up Voice (Phone)',
                        rating: { up: 0, down: 0 },
                        updated_datetime: '1970-01-19T20:48:32.000',
                    },
                ],
            },
            isLoading: false,
        } as unknown as UseQueryResult<Components.Schemas.ArticlesListPageDto>)
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.ArticleTitle]:
                            'Set up Voice (Phone)',
                        [HelpCenterTrackingEventDimensions.ArticleSlug]:
                            'set-up-voice-(phone)-1',
                        [HelpCenterTrackingEventDimensions.ArticleId]: '1',
                        [HelpCenterTrackingEventDimensions.LocaleCode]: 'en-US',
                        [HelpCenterTrackingEventMeasures.ArticleView]: '1',
                    },
                ],
                decile: null,
            },
        })
        const { result } = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
        )

        expect(mockUseGetHelpCenterArticleList).toHaveBeenCalledWith(
            1,
            { ids: [1], version_status: 'latest_draft' },
            { enabled: true },
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
                        value: '0 | 0',
                    },
                    {
                        type: 'date',
                        value: '1970-01-19T20:48:32.000',
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
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
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

    it('should return an empty array when no data from api', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: null,
        })
        const { result } = renderHook(() =>
            usePerformanceByArticleMetrics({
                statsFilters,
                timezone,
                helpCenterDomain,
                itemPerPage,
                currentPage,
                helpCenterId,
            }),
        )

        expect(result.current).toEqual({
            total: 0,
            isLoading: false,
            data: [],
        })
    })
})
